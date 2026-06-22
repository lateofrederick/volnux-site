Every event in Volnux passes through a six-phase lifecycle. Understanding these phases is essential for writing correct, durable events. Each phase has a specific purpose, runs at a specific time, and provides specific guarantees.

## The Six Phases
```d2
direction: right
I: INITIALIZED\n(setup)
P1: PRE_PROCESS\n(bypass check)
C1: COMMUNICATING\n(external I/O)
P2: PROCESSING\n(compute)
P3: POST_PROCESS\n(routing)
C2: COMPLETED\n(cleanup)

I -> P1 -> C1 -> P2 -> P3 -> C2
```

### INITIALIZED — Setup
The event is instantiated. Framework-internal setup runs. The event's `_setup_event()` method executes. This is where the framework:

* Validates `INIT_PARAMS_SCHEMA` against provided parameters
* Injects `event_init` signal handlers
* Prepares the execution context
* Initializes the command channel listener

User hook: None at this phase. Setup is framework-managed. If you need custom initialisation, use `INIT_PARAMS_SCHEMA` for parameters or lazy initialisation in `process()`.

### COMMUNICATING — External Communication
This phase runs before any computation. Its purpose is to handle all external communication that might block, wait, or require human input.

```python
async def communicate(self, *args, **kwargs) -> None:
    # Wait for a human to approve
    await self.request_human_input(
        title="Approve Trade",
        payload={"trade_id": "123", "amount": 100000},
        timeout_hours=24,
    )
```

What happens here:
* HITL requests (`request_human_input`)
* External event waiting (`wait_for_event`)
* Condition polling (`wait_for_condition`)
* S3 file arrival checks
* Payment webhook confirmation
* Any I/O that might take seconds to hours

Critical design decision: `communicate()` runs BEFORE `process()`. This eliminates the HITL state restoration problem entirely. When `communicate()` suspends, `process()` has never run. There's no state to restore. When the event resumes, `process()` runs once with all external data ready.

The one-wait constraint: An event can suspend only once per lifecycle. If you call `request_human_input()` in `communicate()`, the event suspends. On resumption, control jumps directly to `process()`. Any code after the suspension call is dead code. If you need multiple external dependencies, compose them in the graph (multiple events) or use a single composite wait.

Short waits vs long waits:
* **Long waits (minutes to days)**: Use `communicate()`. The event suspends fully. Zero resources held. The `RehydrationManager` wakes the event when the response arrives.
* **Short waits (milliseconds to seconds)**: Use standard `async`/`await` in `process()`. The event stays warm. No checkpointing overhead. Good for API calls, database queries, quick polling.

If you don't need external communication, don't override `communicate()`. The default is a no-op. The event proceeds directly to PRE_PROCESS.

### PRE_PROCESS — Bypass Check
This phase checks whether the event should be skipped entirely.

```python
def bypass(self) -> Optional[Tuple[bool, Any]]:
    """Override to skip execution and provide a cached result."""
    if self.input_hash in self._cache:
        return True, self._cache[self.input_hash]
    return None
```

How it works:
* If `run_bypass_event_checks` is True (the default), the framework calls `bypass()`.
* If `bypass()` raises `NotImplementedError` (the default), the event proceeds normally.
* If `bypass()` returns `(True, result)`, the framework sets `exec_status=True`, `exec_result=result`, and raises `SkipExecutionError`. All remaining phases are skipped. The result is used as if `process()` returned it.
* If `bypass()` returns `None`, the event proceeds normally.

Common use cases:
* **Cache hit**: Return a cached result, skip computation.
* **Fresh asset**: The `@asset` decorator injects a `bypass()` that checks the AssetCatalog. If the asset is fresh, it returns the last materialisation.
* **Feature flag**: Return an empty result for a disabled feature.

Persistence: The coordinator handles result persistence based on the event's `persist_result` class attribute and the result's own `is_persisted` metadata. The `bypass()` method doesn't manage persistence — it just returns data.

### PROCESSING — Pure Computation
This is where your business logic lives. The event does its actual work.

```python
async def process(self, *args, **kwargs) -> Tuple[bool, Any]:
    data = await self.previous_result.first()
    result = transform(data.content)
    return True, result
```

Rules:
* Must be `async def` in class-based events.
* Must return `(bool, Any)` — success/failure and result data.
* `process()` is for computation — transforming data, running models, making decisions.
* Don't wait for humans here. Use `communicate()`.
* Don't suspend for external reasons here. Use `communicate()`.
* Short I/O (API calls, DB queries) is fine with `async`/`await`.

The framework guarantee: `process()` runs exactly once per event execution. If the event is suspended in `communicate()`, `process()` hasn't run yet. When the event resumes, `process()` runs with all external data ready. If the event is resumed from a checkpoint, `process()` may re-run — ensure it's idempotent.

After `process()` returns, the `after_process()` hook fires. Override it to inspect the result or trigger side effects like logging or signaling. It cannot modify the result. For that, use `process()` itself.

```python
async def after_process(self, exec_status: bool, exec_result: Any) -> None:
    """Hook called after process() completes. Observation only."""
    if not exec_status:
        logger.error(f"Event failed: {exec_result}")
```

### POST_PROCESS — Routing
This phase determines what happens next based on the event's result.

Framework responsibilities:
* Evaluate the event's return value
* Follow conditional branches (via `goto()` or success/failure paths)
* Record the event's result in the `ExecutionContext`
* Make the result available to downstream events via `previous_result`
* Trigger the `@asset` decorator's materialisation recording

User hook: None at this phase. Routing is framework-managed. If you need dynamic routing, use `self.goto()` in `process()` or `after_process()` to set the descriptor before this phase runs.

### COMPLETED — Cleanup
The event has finished. All resources are released.

Framework responsibilities:
* Call `provider.cleanup()` on every registered resource
* Close file handles, release database connections, terminate subprocesses
* Stop the resource monitor
* Deregister from the Checkpoint Manager's active monitor
* Finalise the OTel span
* Emit the `task_completed` soft signal

Guarantee: Even if the event fails, cleanup runs. The framework ensures resources are released. No leaked file handles. No orphaned database connections.

## The communicate() Hook
`communicate()` is what makes Volnux's HITL unique. It separates external communication from computation, enabling suspension without state restoration.

### External Communication Before Processing
The pattern:

```python
class ApproveTrade(EventBase):
    async def communicate(self, *args, **kwargs):
        await self.request_human_input(
            title="Approve Large Trade",
            payload={"trade_id": self.trade_id, "amount": self.amount},
            options=["Approve", "Reject"],
            timeout_hours=4,
        )
    
    async def process(self, *args, **kwargs):
        # This runs AFTER the human responds
        response = await self.previous_result.filter(type="hitl").first()
        if response.content["decision"] == "Approve":
            return True, self.execute_trade()
        return False, "Trade rejected by human"
```

`communicate()` requests human input and suspends. Hours later, the human responds. The `RehydrationManager` wakes the event. `process()` runs with the response available in `previous_result`. The event code is linear. The suspension is invisible.

### Suspension and Resource Release
When `communicate()` suspends:
* The event's state is checkpointed (if checkpointing is enabled)
* All resources bound to `self` are captured by the `ResourceMonitor`
* The event's executor slot is released — zero resources held
* The HITL request is enqueued in Redis
* The `RehydrationManager` watches for the response
* The workflow engine continues with other events

The event is not "paused." It's fully released. It consumes nothing while waiting.

### Short Waits vs Long Waits

| | `communicate()` | `async`/`await` in `process()` |
| :--- | :--- | :--- |
| **Duration** | Minutes to days | Milliseconds to seconds |
| **Resource usage**| Zero — fully released | Holds coroutine/thread |
| **Checkpointed** | Yes — before suspension | No — event stays warm |
| **Survives restart**| Yes — `RehydrationManager`| No — lost on crash |
| **Use case** | Human approval, webhook wait | API call, DB query |

The heuristic: if the wait is longer than ~2 minutes, use `communicate()`. If shorter, use `async`/`await` in `process()`.

## The bypass() Hook
`bypass()` allows an event to be skipped entirely, returning a pre-computed or cached result.

### Skipping Execution
The default implementation raises `NotImplementedError` — the event never bypasses. Override it to add skip logic:

```python
def bypass(self) -> Optional[Tuple[bool, Any]]:
    # Check in-memory cache
    if self.input_hash in self._cache:
        return True, self._cache[self.input_hash]
    
    # Don't skip — execute normally
    return None
```

Return values:
* `None` — Execute normally
* `(True, result)` — Skip with success
* `(False, error)` — Skip with failure

### Cache Hit Pattern
```python
class ExpensiveCalculation(EventBase):
    _cache = {}
    
    def bypass(self) -> Optional[Tuple[bool, Any]]:
        cache_key = hash(str(self.options.extras))
        if cache_key in self._cache:
            return True, self._cache[cache_key]
        return None
    
    async def process(self, *args, **kwargs):
        result = await self.heavy_computation()
        cache_key = hash(str(self.options.extras))
        self._cache[cache_key] = result
        return True, result
```

### Fresh Asset Pattern
The `@asset` decorator automatically injects a `bypass()` that checks the `AssetCatalog`:

```python
# Injected by @asset decorator
def bypass(self) -> Optional[Tuple[bool, Any]]:
    if not asset_catalog.is_stale(self.asset_key):
        materialization = asset_catalog.get_latest(self.asset_key)
        return True, materialization.result
    return None
```

If the asset is fresh, the event is skipped. The cached materialization is used. No computation occurs. This is how Volnux achieves self-healing pipelines — stale assets are rematerialized, fresh assets are reused.

## The after_process() Hook
`after_process()` fires after `process()` completes. It's an observation hook — it can inspect the result but not modify it.

```python
async def after_process(self, exec_status: bool, exec_result: Any) -> None:
    """Inspect the result after process() completes."""
    if not exec_status:
        logger.error(f"Event {self.__class__.__name__} failed: {exec_result}")
        await self.notify_operator(f"Event failed: {exec_result}")
```

It can trigger actions because it runs in the event's execution context — call `self.goto()`, `self.enqueue_checkpoint()`, or access `self.previous_result`. But the result itself flows unchanged to the next phase.

## The acquire_resource() Method
Resources that need to survive preemption and crashes are acquired through `acquire_resource()`.

```python
async def process(self, *args, **kwargs):
    file_handle = await self.acquire_resource(
        "file_handle",
        FileHandleProvider,
        {"path": self.input_file, "mode": "rb"},
    )
    
    # Use the resource normally
    data = await file_handle.read(8192)
    return True, data
```

### Resource Providers
A `ResourceProvider` is a typed protocol with three class methods:

```python
class FileHandleProvider(ResourceProvider[typing.IO]):
    @classmethod
    def save_state(cls, resource: typing.IO) -> Dict[str, Any]:
        return {
            "path": resource.name,
            "mode": resource.mode,
            "position": resource.tell(),
        }

    @classmethod
    def restore_state(cls, data: Dict[str, Any]) -> typing.IO:
        file_handle = open(data["path"], data["mode"])
        file_handle.seek(data["position"])
        return file_handle

    @classmethod
    def cleanup(cls, resource: typing.IO) -> None:
        if not resource.closed:
            resource.close()
```

### Checkpoint-Aware Resources
On first execution, `acquire_resource()` creates the resource via the provider. On resumption from a checkpoint, the factory is skipped — the resource is restored from the checkpointed state. The event code is identical in both cases. The file handle is valid whether newly opened or restored at the correct offset.

### Cleanup Guarantees
Resources are automatically cleaned up when the event completes. The framework calls `provider.cleanup()` on every registered resource. Even if `process()` raises an exception, cleanup runs. No leaked handles. No orphaned connections.

## The goto() Method — Dynamic Routing
`goto()` overrides the normal success/failure routing and directs execution to a specific branch descriptor.

```python
class ValidateTrade(EventBase):
    async def process(self, *args, **kwargs):
        trade = await self.previous_result.first()
        
        if trade.content["amount"] > 1000000:
            self.goto(0, True, trade)   # Large trade — manual review
        elif trade.content["valid"]:
            self.goto(1, True, trade)   # Valid — auto-approve
        else:
            self.goto(2, False, trade)  # Invalid — reject
```

The Pointy-Lang file declares the branches:

```pointy
ValidateTrade (
    0 -> ManualReview -> ApproveTrade,    # Large trades
    1 -> AutoApprove -> ExecuteTrade,     # Valid trades
    2 -> RejectTrade -> NotifyClient      # Invalid trades
)
```

`goto()` must reference a descriptor that exists in the Pointy-Lang file. Invalid descriptors raise `TaskSwitchingError`. The routing decision is made in `process()`. The framework handles the transition.
