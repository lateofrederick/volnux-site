# Events

An **Event** is a single unit of work in your pipeline. Events are designed to be entirely decoupled from the orchestration layer—they take inputs, execute business logic, and return a result. The Pipeline handles the routing of that result.

## Defining Events

The standard way to define an event is by inheriting from the `EventBase` class and overriding the `process` method.

```python
from volnux import EventBase

class ProcessPayment(EventBase):
    def process(self, amount: float, **kwargs):
        # Your business logic here
        return True, "Payment processed successfully"
```

The `process` method should always return a tuple: `(success_boolean, result_data)`. If the first element is `True`, the event is considered a success (Descriptor `1`). If `False`, it's a failure (Descriptor `0`). If you return an integer as the first element instead of a boolean, that integer will act as a custom Descriptor (`3-9`) for routing.

### Function-Based Events

If you don't need a full class, you can use the `@event` decorator to turn any function into a pipeline event.

```python
from volnux.decorators import event

@event()
def fetch_user(user_id: str, **kwargs):
    return True, {"id": user_id, "name": "Alice"}
```

## Configuring Executors

By default, Volnux executes events using a system-optimized thread pool. However, you can explicitly configure exactly how each event should run (e.g., using threads for I/O bounds, or processes for CPU bounds) using `ExecutorInitializerConfig`.

```python
from volnux import EventBase, ExecutorInitializerConfig
from concurrent.futures import ProcessPoolExecutor

# Define executor constraints
config = ExecutorInitializerConfig(
    max_workers=4,
    max_tasks_per_child=50,  # Recycle processes to prevent memory leaks
    thread_name_prefix="payment_worker_"
)

class HeavyComputationEvent(EventBase):
    executor = ProcessPoolExecutor
    executor_config = config
    
    def process(self, *args, **kwargs):
        return True, "Computed"
```

You can pass the same configurations directly to the `@event` decorator:

```python
@event(
    executor=ProcessPoolExecutor,
    max_workers=4,
    max_tasks_per_child=10
)
def compute_heavy_task(*args, **kwargs):
    pass
```

## Event Evaluation States

When an event spins up multiple internal tasks (e.g., when receiving an array of data from a previous pipeline step), you can control how the overall success of the event is evaluated using `EventExecutionEvaluationState`.

```python
from volnux import EventBase, EventExecutionEvaluationState

class BulkProcess(EventBase):
    # Only succeed if ALL tasks in this event succeed (Default)
    execution_evaluation_state = EventExecutionEvaluationState.SUCCESS_ON_ALL_EVENTS_SUCCESS
    
    # Other options:
    # - FAILURE_FOR_PARTIAL_ERROR: Fail if ANY task fails.
    # - SUCCESS_FOR_PARTIAL_SUCCESS: Succeed if AT LEAST ONE task succeeds.
    # - FAILURE_FOR_ALL_EVENTS_FAILURE: Fail only if ALL tasks fail.
    
    def process(self, *args, **kwargs):
        pass
```

## Retry Policies

Transient network failures or flaky APIs shouldn't crash your pipeline. Volnux provides a robust `RetryPolicy` to automatically retry failing events.

```python
from volnux.base import RetryPolicy
import requests

class FlakyAPIEvent(EventBase):
    retry_policy = RetryPolicy(
        max_attempts=5,        # Try up to 5 times
        backoff_factor=0.5,    # Increase wait time exponentially
        max_backoff=5.0,       # Never wait longer than 5 seconds between retries
        retry_on_exceptions=[requests.exceptions.Timeout, ConnectionError]
    )
    
    def process(self, url: str, **kwargs):
        response = requests.get(url)
        return True, response.json()
```

If the event raises an exception that is not in the `retry_on_exceptions` list, it fails immediately. Otherwise, it backs off and retries until `max_attempts` is reached. You can also listen to the `event_execution_retry` SoftSignal to log retries in real-time.

