Events are the fundamental units of work in a Volnux pipeline. They represent a single, discrete action or step within your workflow such as extracting data from a database, waiting for human approval, transforming a dataset, or making an HTTP request.

If you are familiar with other orchestration tools, you can think of a Volnux **Event** as similar to a "Task" in Prefect or an "Operator" in Airflow. Events encapsulate your business logic and define how data flows, changes, and pauses at a specific point in a pipeline.


## Defining an Event

There are two primary ways to define an event in Volnux: using the `@event` decorator for simplicity, or subclassing `EventBase` for advanced customization, state management, and external communication.

### The `@event` Decorator

The easiest way to create an event is by applying the `@event` decorator to any Python function.

```python
import typing
from volnux.decorators import event

@event(name="ProcessOrder")
def process_order(self, order_data: dict) -> typing.Tuple[bool, typing.Any]:
    processed_amount = order_data.get("amount", 0) * 1.2
    result = {"order_id": order_data["id"], "total": processed_amount}

    # Return a tuple indicating success (bool) and the result (Any)
    return True, result
```

### Subclassing `EventBase`

For complex events that require advanced initialization, custom cleanup, human-in-the-loop (HITL) communication, or dynamic control flow, subclass `EventBase` directly.

```python
import typing
from volnux.event.base import EventBase

class ProcessOrderEvent(EventBase):
    async def process(self, *args, **kwargs) -> typing.Tuple[bool, typing.Any]:
        order_data = kwargs.get("order_data", {})

        processed_amount = order_data.get("amount", 0) * 1.2
        result = {"order_id": order_data.get("id"), "total": processed_amount}

        return True, result

    async def cleanup(self, *args, **kwargs) -> None:
        # Optional: release resources or connections
        print("Cleaning up ProcessOrderEvent")
```



## The Event Lifecycle

Volnux events are robust and checkpoint-driven, moving through distinct phases during execution. If an event is preempted, paused, or suspended, it can resume from its exact phase:

1. **`INITIALIZED`**: Basic setup, retry initialization, context linking.
2. **`PRE_PROCESS`**: Evaluates bypass conditions (e.g., `can_bypass_current_event`).
3. **`COMMUNICATING`**: External communications run here (e.g., waiting for external signals or human inputs).
4. **`PROCESSING`**: Executes the core `process()` method (and handles retries).
5. **`POST_PROCESS`**: Result evaluation, StopCondition checking, and signal emitting.
6. **`COMPLETED`**: Resource cleanup and finalization.



## External Communication & Human-In-The-Loop (HITL)

Volnux natively supports pausing execution to wait for external systems or human approvals without consuming active worker resources. You can implement the `communicate()` hook to pause execution and fetch inputs before `process()` runs.

### Requesting Human Input
```python
async def communicate(self, order: dict, **kwargs):
    if order["amount"] > 100_000:
        await self.request_human_input(
            title="High-value order approval",
            description=f"Order {order['id']} exceeds threshold.",
            payload={"order": order},
            options=["approve", "reject"],
            timeout_hours=4,
        )

        # When execution resumes, read the human response:
        response = self.previous_result.filter(type="human_response").first()
        return {"approval_decision": response.content["decision"]}
```

### Waiting for Conditions (Sensors)
Similar to an Airflow Sensor, you can suspend an event until an arbitrary condition is met:

```python
async def communicate(self, batch_id: str, **kwargs):
    await self.wait_for_condition(
        condition_fn=lambda: s3_object_exists("data-lake", f"batches/{batch_id}.csv"),
        title="Waiting for batch file",
        timeout_hours=4,
        poll_interval_seconds=60.0,
    )
```

You can also use `wait_for_event()` to pause the event until a specific asynchronous event arrives on the event bus (e.g., `ml.training.completed`).



## Event Return Values and Control Flow

Every `process()` method must return a standard tuple containing two elements:

```python
return True, {"status": "success"}
```

1. **Success Flag (`bool`)**: `True` if the processing logic succeeded. `False` triggers error-handling or retries.
2. **Result (`Any`)**: Serialised data produced by the event.

> [!IMPORTANT]
> The result data must be serializable. Volnux heavily relies on checkpointing results. Avoid returning non-serializable objects like file handles.

### Dynamic Control Flow (`goto`)
If your event logic dictates that the pipeline should dynamically branch to another task descriptor, you can use the `goto()` method inside `process()`. This raises a `SwitchTask` signal internally, altering the flow.

```python
self.goto(descriptor=2, result_success=True, result={"branch": "fast_track"})
```

### Stop Conditions
You can configure events to intentionally halt the workflow entirely based on their outcomes using `StopCondition` (`NEVER`, `ON_SUCCESS`, `ON_ERROR`, `ON_ANY`).



## Retries and Error Handling

Real-world pipelines encounter transient failures. Volnux provides robust retry policies complete with exponential backoffs.

```python
from volnux.decorators import event
from volnux.mixins.event import RetryPolicy

@event(
    name="FetchExternalData",
    retry_policy=RetryPolicy(
        max_attempts=5,
        backoff_factor=2.0,
        retry_on_exceptions=[ConnectionError, TimeoutError]
    )
)
def fetch_data(self) -> typing.Tuple[bool, typing.Any]:
    # Logic that might fail
    return True, {"status": "success"}
```



## Commands and Remote Control

Volnux events are inherently responsive. Because they run alongside a background `EventCommandMixin` listener, you can remote-control them while they are executing:
- **PAUSE / RESUME**: Suspends execution seamlessly via internal async gates.
- **CANCEL**: Safely aborts execution.
- **UPDATE_PRIORITY**: Preempts the task, checkpoints it, and re-queues it dynamically.



## Categorization and Metadata

Volnux provides semantic classification for events to help organize large data platforms. Common categories from `EventCategory` include `EXTRACT`, `TRANSFORM`, `LOAD`, `HTTP`, `MESSAGING`, `VALIDATE`, `AI`, and `AGENT`.

```python
from volnux.event.base import EventBase, EventCategory

class ExtractUserData(EventBase):
    categories = frozenset({EventCategory.EXTRACT, EventCategory.DATABASE})
    version = "1.2.0"
    deprecated = False

    async def process(self, *args, **kwargs) -> typing.Tuple[bool, typing.Any]:
        return True, {"users": []}
```

Events also natively support versioning (`version`, `changelog`, `deprecated` flags).



## Tracking Assets

If an event produces a meaningful dataset or artifact, use the `@asset` decorator to natively track it.

```python
from volnux.decorators import asset
from volnux.asset import AssetKey

@asset(
    key=AssetKey("cleaned_users_data"),
    description="User data with nulls removed"
)
class CleanUsersEvent(EventBase):
    async def process(self, **kwargs) -> typing.Tuple[bool, typing.Any]:
        return True, [{"id": 1, "name": "Alice"}]
```

When the event successfully completes, Volnux automatically records an `AssetMaterialisation` in the catalog, tracking lineage and freshness policies.



## Next Steps

Now that you understand the powerful lifecycle, communication hooks, and tracking built into Volnux Events, you can learn how to orchestrate them together into full **Pipelines** and construct task dependencies using **Pointy-Lang** (`.pty` files).
