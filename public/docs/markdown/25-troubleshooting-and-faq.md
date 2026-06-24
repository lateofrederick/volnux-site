This section covers common issues, error messages, and frequently asked questions. When something goes wrong, start here.

## Common Errors and Solutions

### `EmptyResultError: The process() method of 'MyEvent' did not return a result`

**Cause:** Your event's `process()` method returned `None` or forgot to include a `return` statement.

**Solution:** Every `process()` method must return a tuple of `(bool, result)`:

```python
# Wrong
async def process(self, *args, **kwargs):
    data = transform(args)
    # Forgot to return

# Correct
async def process(self, *args, **kwargs):
    data = transform(args)
    return True, data
```

The same applies to `bypass()` if you override it:

```python
# Wrong
def bypass(self):
    if condition:
        return True, cached_data
    # No return for the else case

# Correct
def bypass(self):
    if condition:
        return True, cached_data
    return None  # Explicitly decline to bypass
```

### `ToolPermissionError: Agent attempted to call undeclared tool`

**Cause:** An LLM agent attempted to call a tool not declared in its `tools` list.

**Solution:** Add the tool to the agent's `tools` declaration:

```python
class MyAgent(AgentEventBase):
    tools = [FetchData, CalculateRisk, SendEmail]  # Add SendEmail
```

This is a security feature. Agents can only call tools they've been explicitly authorized to use. The attempt is logged in the audit trail.

### `NestedMetaEventError: Meta Events cannot be used as Template Events`

**Cause:** You tried to nest one Meta Event inside another:

```pointy
# Wrong
MAP<FILTER<IsProfitable>>

# Also wrong
MAP<REDUCE<AggregateResults>>
```

**Solution:** Chain Meta Events sequentially instead:

```pointy
# Correct
FILTER<IsProfitable> -> MAP<ValidateTrade>
```

Meta Events are orchestrators. Nesting them would create an orchestrator inside an orchestrator, which violates the constraint that orchestrators run in async/thread and cannot contain other orchestrators in their template slot.

### `WorkflowSourceError: Source 'trading-events' not found`

**Cause:** The workflow references events from a package that hasn't been registered.

**Solution:** Register the source in your workflow's `ready()` method:

```python
def ready(self):
    self.register_source(WorkflowSource(
        name="trading-events",
        source_type=RegistrySource.HUB,
        location="trading-team/trading-events",
        version="2.1.0",
    ))
```

Or if the events are local, check that they're defined in `events.py` and the class names match the Pointy-Lang file exactly.

### `TaskSwitchingError: Cannot switch to descriptor 'X'`

**Cause:** An event called `self.goto(X, ...)` where `X` doesn't exist in the Pointy-Lang conditional branches.

**Solution:** Ensure the descriptor matches a branch in the Pointy-Lang file:

```pointy
ValidateTrade (
    0 -> ApproveTrade,    # goto(0)
    1 -> RejectTrade,     # goto(1)
    2 -> EscalateTrade    # goto(2)
)
```

Calling `self.goto(3, ...)` would raise this error because descriptor `3` doesn't exist.

### `Dependency conflict: No compatible version found`

**Cause:** Two registered sources require incompatible versions of the same dependency.

**Solution:** The error message shows the conflicting requirements. You need to either:
* Upgrade one of the sources to a version with compatible dependencies.
* Pin one of the sources to an older version that uses a compatible dependency.
* Contact the package maintainers to resolve the conflict.

### `ValidationError: Field 'market' expected type 'str', got 'int'`

**Cause:** A trigger or manual execution passed a parameter with the wrong type.

**Solution:** Check the workflow's `Pipeline` class for the expected types:

```python
class TradingPipeline(Pipeline):
    market: str = InputDataField(required=True)  # Expects str
```

And ensure triggers pass the correct type:

```python
# Wrong
ScheduleTrigger(workflow_params={"market": 123})

# Correct
ScheduleTrigger(workflow_params={"market": "US"})
```

### `RuntimeError: This Saga instance has already been executed`

**Cause:** You called `saga.execute()` twice on the same `Saga` instance.

**Solution:** Create a new `Saga` instance for each execution:

```python
# Wrong
saga = Saga()
await saga.execute()
await saga.execute()  # Reusing same instance

# Correct
saga = Saga()
await saga.execute()
saga = Saga()  # New instance
await saga.execute()
```

### `SagaCompensationError: Manual intervention may be required`

**Cause:** A Saga step failed AND one or more compensation steps also failed. The system may be in an inconsistent state.

**Solution:** This is rare and typically indicates an infrastructure problem (database unreachable, Redis down). Check:
* Are all persistence backends healthy? (`volnux health` or `GET /api/v1/health`)
* Are there network issues between Volnux and the backends?
* Check the logs for the specific compensation failures.

The `SagaCompensationError` includes the list of failed compensations. Most will self-resolve when the backend recovers. Checkpoint TTLs in Redis provide eventual cleanup for orphaned records.

## Debugging Workflows

### Enable Debug Logging
Set the log level to `DEBUG` to see detailed execution flow:

```python
# config.py
import logging

logging.getLogger("volnux").setLevel(logging.DEBUG)
```

Or for a single workflow run:
```bash
volnux --log-level DEBUG workflow run data_processing
```

Debug logs show every phase transition, checkpoint operation, and engine decision.

### Use the OTel Trace
Every execution produces a trace. Find the trace ID in the logs or CLI output, then view it in Grafana/Tempo:

```bash
volnux workflow status data_processing
# Output includes: Trace ID: 0af7651916cd43dd8448eb211c80319c
```

The trace shows every event, every phase, timing, attributes, and errors. Drill into slow spans. Check span events for soft signals.

### Inspect the ExecutionContext
For paused or failed workflows, inspect the execution context:

```bash
volnux workflow status trade-reconciliation --verbose
```

This shows the full execution chain — which events ran, what they returned, and where the workflow stopped.

### Test Events in Isolation
You can test an individual event without running the full workflow:

```python
from my_project.workflows.trading.events import CalculateRisk

event = CalculateRisk()
event.options.extras = {"confidence": 0.95}

success, result = await event.process()
print(f"Success: {success}, Result: {result}")
```

### Validate Pointy-Lang Separately
```bash
volnux workflow validate data_processing --format json
```
Returns the compiled graph as JSON. Inspect it to verify the graph structure matches your intent.

## Understanding OTel Traces

### Finding the Right Trace
By workflow execution:
```bash
volnux workflow status data_processing
# Note the trace_id
```

By time range: In Grafana/Tempo, query: `{resource.service.name="volnux-engine"} | span:workflow.name="data_processing"`

By error: Query: `{status=ERROR}` to find all failed executions.

### Reading a Trace
```text
Workflow: data_processing (2.3s)
├── FetchData (1.2s) — slow
│   ├── Phase: COMMUNICATING (800ms) — waiting for API
│   ├── Phase: PROCESSING (400ms)
│   └── Result: success
├── ProcessData (0.8s)
│   ├── Phase: PROCESSING (800ms)
│   └── Result: success
└── SaveData (0.3s)
    ├── Phase: PROCESSING (300ms)
    └── Result: success
```

In this trace, `FetchData` is the bottleneck. The `COMMUNICATING` phase took 800ms — the event was waiting for an external API. Consider adding a cache or increasing the timeout.

### Common Trace Patterns
* **Fast bypass**: An event shows a `bypass.skipped` span event and near-zero duration. This is correct — the `bypass()` hook returned a cached result.
* **Long COMMUNICATING**: The event spent time waiting for external input. If this is a HITL request, this is expected (human response time). If this is an API call, consider moving it to `process()` with async/await.
* **Many retries**: An event shows `retry.started` span events. Check the error messages to understand why. Consider adjusting the retry policy or fixing the underlying issue.
* **Deep nesting**: The trace tree is very deep (many nested `{}` subgraphs). This is normal for complex workflows. The fractal tree reflects your Pointy-Lang structure.

## Performance Tuning

### Checkpointing Overhead
If checkpointing is slowing down your workflow:

* Disable for high-throughput events:
```python
class FastIngest(EventBase):
    checkpointing = False
```

* Adjust the checkpoint interval:
```python
# config.py
CHECKPOINT_INTERVAL = 60.0  # Default: 30.0
```

* Use `TRANSIENT` results for intermediate data:
```python
class IntermediateEvent(EventBase):
    persist_result = ResultPersistence.TRANSIENT
```

### Executor Pool Sizing
Monitor pool utilization in Grafana. If the process pool is always full:
* Increase the pool size (subject to system resources).
* Move I/O-bound events from `ProcessPoolExecutor` to `DefaultExecutor` or `ThreadPoolExecutor`.
* Consider distributing work across nodes with `RemoteExecutor`.

### Database Query Performance
If `previous_result.filter()` is slow:
* Check that the filter fields are indexed in PostgreSQL. The `name`, `task_id`, and `created_at` fields are indexed by default.
* Use `limit()` to restrict result sets:
```python
results = await self.previous_result.filter(status="active").limit(100)
```
* Use `order_by()` with indexed fields.
* Consider adding custom indexes for frequently queried fields.

### Large Result Sets
For workflows processing millions of records:
* Use `\|->` streaming instead of `->` batch transfer.
* Use `MAP<Event>[batch_size=N]` to control memory.
* Use `ResultPersistence.TRANSIENT` for intermediate results that don't need durability.

## Resource Management

### File Handles Not Closing
If you see "too many open files" errors:
* Ensure resources are acquired via `acquire_resource()`:
```python
# Correct — framework manages lifecycle
self.file_handle = await self.acquire_resource(
    "file_handle", FileHandleProvider, {"path": path, "mode": "rb"}
)

# Wrong — manual open, no cleanup
self.file_handle = open(path, "rb")
```
* Check that your `ResourceProvider.cleanup()` method actually closes the resource.

### Memory Growth Over Time
If memory usage grows during long workflow executions:
* Check for unbounded accumulation in event state. Lists that grow without bound should use generators or periodic flush.
* Ensure streaming with `\|->` is used for large data transfers.
* Check that `ResultStream` is being consumed (not accumulated). An unconsumed stream holds references to all its items.

### Process Pool Exhaustion
If you see "no available process slots" errors:
* Check that orchestrators (subgraphs, Meta Events) are not configured with `ProcessPoolExecutor`.
* Check that I/O-bound events use `DefaultExecutor` or `ThreadPoolExecutor`, not `ProcessPoolExecutor`.
* Increase the process pool size if genuinely needed.

## FAQ

### What's the difference between `->` and `\|->`?
`->` passes the complete result before the next event starts. All data is materialized.

`\|->` streams data. The downstream event can begin processing before the upstream event completes. Memory is bounded by `batch_size × pipeline_depth`.

Rule of thumb: Use `\|->` for large datasets or continuous streams. Use `->` for small datasets or when downstream needs the complete result.

### What's the difference between `\|\|` and `{}`?
`\|\|` is true parallelism. Events run in separate processes on different CPU cores. Use for CPU-bound work.

`{}` is cooperative concurrency. Events run as coroutines or threads sharing the event loop. Use for I/O-bound work and orchestration.

Rule of thumb: If your event spends most of its time computing (transforming data, running models, calculating), use `\|\|`. If it spends most of its time waiting (API calls, database queries, human input), use `{}`.

### Can I mix `\|\|` and `{}`?
Yes, with constraints. `{}` can contain `\|\|` at the leaf level:
```pointy
{A || B, C -> D}  # Valid
```

`\|\|` cannot contain `{}`:
```pointy
A || {B, C}  # Invalid — orchestrator cannot be a process
```

### Do I need to use the project scaffold?
No. You can use the single-file approach with `@event` decorators and inline Pointy-Lang:
```python
from volnux.decorators import event
from volnux.pipeline import Pipeline

@event()
def A(self): return True, "done"

@event()
def B(self): return True, "done"

class MyPipeline(Pipeline):
    class Meta:
        pointy = "A -> B"

MyPipeline().start()
```

The scaffold enables auto-discovery, CLI management, and governance features. Use the single-file approach for learning and prototyping. Use the scaffold for production.

### What happens if a workflow crashes?
If checkpointing is enabled, the workflow resumes from the last persisted checkpoint. The current event resumes from the exact phase where it was interrupted. Resources (file handles, connections) are restored. The workflow continues as if nothing happened.

If checkpointing is disabled, the workflow restarts from the beginning.

### How do I add a schedule to my workflow?
Register a `ScheduleTrigger` in `ready()`:

```python
def ready(self):
    self.register_trigger(ScheduleTrigger(
        cron="0 6 * * MON-FRI",
        timezone="America/New_York",
        workflow_params={"market": "US"},
    ))
```

### Can I run Volnux without PostgreSQL?
Yes. For development, Volnux uses SQLite for all persistence. For production, you can use SQLite for trigger state and Redis for checkpoints. PostgreSQL is recommended for governance data (audit trail, asset catalog) but not required for basic operation.

### How do I publish my events for other teams to use?
```bash
volnux manifest generate
volnux manifest validate
volnux publish
```
Your events are published to EventHub with a validated manifest. Other teams add your package as a `WorkflowSource` in their `ready()` method.

### What's the maximum workflow size?
There is no hard limit. The static graph is compiled to an in-memory structure. The ExecutionContext chain grows with the number of events. For workflows with millions of events, use the lazy rehydrator (proxies for historical contexts) and streaming (`\|->`) to bound memory.

### Does Volnux support exactly-once execution?
Volnux provides at-least-once execution with idempotency support. The `is_persisted` flag on `EventResult` prevents double-committing. Events should be designed to be idempotent — the framework may replay an event after a crash if its checkpoint wasn't persisted before the crash.

Temporal provides exactly-once via deterministic replay. Volnux trades exactly-once for O(1) resumption and no determinism requirement. For governance workloads, at-least-once with idempotency is the correct tradeoff.

### How do I get help?
* **Documentation**: https://docs.volnux.dev
* **GitHub Issues**: https://github.com/volnux/volnux/issues
* **Community Discord**: https://discord.gg/volnux
* **EventHub**: https://eventhub.volnux.dev
