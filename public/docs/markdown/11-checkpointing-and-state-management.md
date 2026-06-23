Checkpointing is what makes Volnux workflows durable. An event can run for hours, crash, and resume from where it left off — not from the beginning. This is not a feature layered on top of execution. It's built into the event lifecycle, the persistence layer, and the resource management system.

## The CheckpointManager
The `CheckpointManager` is the engine's durability backbone. It runs as a coroutine — lightweight, non-blocking, separate from event execution. It handles two kinds of checkpointing: passive (events push snapshots) and active (it monitors objects and snapshots them on change).

### Passive Queue — Event-Driven Checkpoints
Events push state snapshots to an `asyncio.Queue`. The `CheckpointManager` drains the queue and persists snapshots to the backend.

```python
# Inside the event lifecycle
await self.enqueue_checkpoint()  # Event pushes snapshot to queue

# Event continues immediately — no I/O wait
```

The flow:

```d2
direction: down

Event: Event (running) {
  direction: down
  E1: Take state snapshot\nin-memory, fast
  E2: enqueue_checkpoint
  E3: Continue executing\nno I/O wait
  
  E1 -> E2 -> E3
}

CM: CheckpointManager (separate coroutine) {
  direction: down
  C1: Dequeues snapshots
  C2: Merges snapshots for same event\nlatest wins
  C3: Upserts to backend\nRedis, PostgreSQL
  C4: Confirms persistence
  
  C1 -> C2 -> C3 -> C4
}

Event.E2 -> CM.C1: puts on queue { style.stroke-dasharray: 5 }
```

The event never waits for disk or network. The snapshot is captured in memory — a shallow dictionary copy, microseconds of work. The expensive I/O happens in the `CheckpointManager`, on its own time.

**Backpressure**: If the `CheckpointManager` can't keep up (slow disk, network issue), the queue fills. When full, `enqueue_checkpoint()` blocks until there's capacity. The event slows down rather than losing data. This is the correct behavior for a durable system.

**Configurable checkpointing**: Checkpointing can be enabled or disabled at three levels:

```python
# Project level (config.py)
PROJECT_CHECKPOINTING = True

# Workflow level (workflow.py)
class TradingConfig(WorkflowConfig):
    checkpointing = True

# Event level
class FastIngest(EventBase):
    checkpointing = False  # Raw ingestion, speed over durability
```

When disabled, events run at full speed with zero persistence overhead. When enabled, durability is automatic. The user controls the tradeoff.

### Active Monitor — ExecutionContext and Resources
The `CheckpointManager` also actively monitors objects that need periodic snapshotting:

**ExecutionContext monitoring:**
The `ExecutionContext` is the shared state that all events in a workflow access. It accumulates results as the workflow progresses. The `CheckpointManager` monitors it on a configurable interval:

```python
# Every 30 seconds, capture ExecutionContext state
checkpoint_manager.monitor(
    obj=execution_context,
    snapshot_fn=lambda ctx: ctx.get_state(),
    restore_fn=lambda ctx, state: ctx.set_state(state),
    interval=30.0,
)
```

If the process crashes, the `ExecutionContext` is restored from the last snapshot. All upstream results are preserved. The workflow resumes as if nothing happened.

**Resource monitoring:**
Resources acquired via `acquire_resource()` are automatically registered for monitoring. The `ResourceMonitor` periodically captures their state:

```python
# Every 5 seconds, capture current file offset
for name, entry in event._resources.items():
    resource = entry["resource"]
    provider = entry["provider"]
    event._external_resources[name] = {
        "resource_name": name,
        "data": provider.save_state(resource),  # Current state, not acquisition state
        "provider_path": f"{provider.__module__}.{provider.__qualname__}",
    }
```

This is critical: the checkpoint captures the resource's current state, not its state at acquisition time. If a file handle was acquired at offset 0 and has since read 8192 bytes, the checkpoint records offset 8192. On resumption, the handle is restored at the correct position.

### Snapshot Merge Optimization
If an event enqueues multiple snapshots in rapid succession, the `CheckpointManager` merges them before touching storage.

```text
Event enqueues:
    snapshot_1 (t=0.001s)
    snapshot_2 (t=0.002s)
    snapshot_3 (t=0.003s)

CheckpointManager:
    Dequeue: snapshot_1, snapshot_2, snapshot_3
    Merge by event_id: snapshot_3 (latest wins)
    Upsert: snapshot_3 → storage (single write)
```

Three snapshots. One storage write. The intermediate states were never independently persisted — and they don't need to be. Only the latest state matters for recovery.

The merge function:

```python
async def get_latest_snapshot(queue: asyncio.Queue) -> Optional[Any]:
    """Pull the next snapshot and merge same-ID successors."""
    if queue.empty():
        return None
    latest = await queue.get()
    while not queue.empty():
        next_snapshot = queue._queue[0]  # Peek
        if next_snapshot.id == latest.id:
            latest = await queue.get()  # Same ID — overwrite
        else:
            break  # Different ID — return current
    return latest
```

A ReAct agent reasoning for 50 steps enqueues 50 snapshots. The merge collapses them to 1. The storage backend sees 1 write, not 50.

### Shutdown Drain Guarantee
On clean shutdown (SIGTERM, normal exit), the `CheckpointManager` guarantees all snapshots are persisted before the process exits:

**Shutdown sequence:**
1. Stop accepting new events
2. Complete in-flight events (they finish the current batch)
3. Events enqueue final snapshots
4. CheckpointManager:
    1. Drain queue (process all pending snapshots)
    2. Retry failed writes with backoff
    3. Confirm all persisted to the backend
    4. Signal: "checkpoint drain complete"
5. Shutdown proceeds

No data loss on clean shutdown. The only loss scenario is a hard crash (SIGKILL, power loss) where in-queue snapshots haven't been written yet. In that case, the event resumes from the last persisted checkpoint. Some work is re-processed. The `is_persisted` flag on results prevents double-committing.

## The EventCheckpointSnapshot
The checkpoint itself is a formax model stored in Redis (for speed) with optional PostgreSQL backup (for durability):

```python
class EventCheckpointSnapshot(KeyValueStoreIntegrationMixin, BaseModel):
    task_id: str                           # Which task this is
    class_path: str                        # "myapp.events.CalculateRisk"
    phase: EventPhase                      # Where in the lifecycle to resume
    
    init_args: InitArgsTemplate            # Args to reconstruct the instance
    call_args: CallArgsTemplate            # Args passed to process()
    
    external_resources: Dict[str, ResourceState]  # File handles, DB connections
    
    exec_status: bool = False              # What process() returned
    exec_result: Any = None                # The actual return value
    
    retry_count: int = 0                   # Survives preemption
    max_retry_attempts: int = MAX_RETRIES  # Retry policy preserved
    
    timestamp: float                       # When this snapshot was taken
```

What it captures:
* **How to rebuild the event**: `class_path` tells the framework which class to import. `init_args` provides the constructor parameters.
* **Where to resume**: `phase` tells the framework which lifecycle phase was active. If `COMMUNICATING`, resume there (the HITL response is in `previous_result`). If `PROCESSING` and `exec_status` is set, skip to `POST_PROCESS`.
* **What resources were open**: `external_resources` contains the state of every registered resource — file offsets, cursor positions, connection parameters.
* **What the retry state was**: `retry_count` and `max_retry_attempts` are preserved. Preemption doesn't reset the retry budget.

Upsert semantics: Each task has exactly one checkpoint in storage at any time. New checkpoints overwrite old ones. This is different from audit records, which accumulate historically.

## Resource Checkpointing
Resources that need to survive preemption — file handles, database cursors, network connections — are checkpointed through the `ResourceProvider` protocol.

### The ResourceProvider Protocol
```python
class ResourceProvider(Protocol[T]):
    @classmethod
    def save_state(cls, resource: T) -> Dict[str, Any]:
        """Capture the resource's current state."""
        ...
    
    @classmethod
    def restore_state(cls, data: Dict[str, Any]) -> T:
        """Restore the resource from saved state."""
        ...
    
    @classmethod
    def cleanup(cls, resource: T) -> None:
        """Release the resource."""
        ...
```

### save_state(), restore_state(), cleanup()
A concrete example — file handle provider:

```python
class FileHandleProvider(ResourceProvider[typing.IO]):
    @classmethod
    def save_state(cls, resource: typing.IO) -> Dict[str, Any]:
        return {
            "path": resource.name,
            "mode": resource.mode,
            "position": resource.tell(),  # Current offset
        }

    @classmethod
    def restore_state(cls, data: Dict[str, Any]) -> typing.IO:
        file_handle = open(data["path"], data["mode"])
        file_handle.seek(data["position"])  # Restore offset
        return file_handle

    @classmethod
    def cleanup(cls, resource: typing.IO) -> None:
        if not resource.closed:
            resource.close()
```

The lifecycle:
* **First execution**: Event calls `acquire_resource()`. Provider creates the resource. State is captured at `save_state()`. The resource is registered for monitoring.
* **During execution**: The `ResourceMonitor` periodically calls `save_state()` to capture current state. The file offset advances. The checkpoint reflects the latest position.
* **Preemption/crash**: The process dies. The last checkpoint is in Redis. The file handle is orphaned (OS cleans it up on process death).
* **Resumption**: Event calls `acquire_resource()` again. Framework detects a checkpoint exists. Skips the factory. Calls `provider.restore_state()` with the saved data. File is reopened at the correct offset.
* **Completion**: Framework calls `provider.cleanup()`. File is closed. Resource is released.

### Binding Resources to `self`
For a resource to be checkpointable, it must be bound to `self`:

```python
# CORRECT: Bound to self — checkpointable
self.file_handle = await self.acquire_resource(
    "file_handle",
    FileHandleProvider,
    {"path": self.input_file, "mode": "rb"},
)

# WRONG: Local variable — not checkpointable
file_handle = await self.acquire_resource(...)
```

When bound to `self`, the resource becomes part of the event's state. The framework can see it, monitor it, checkpoint it, and clean it up. A local variable is invisible to the framework — it lives and dies with the function call.

## The ResourceMonitor
The `ResourceMonitor` is a lightweight background coroutine that keeps resource state current:

```python
class ResourceMonitor:
    def __init__(self, interval: float = 5.0):
        self.interval = interval
    
    async def _monitor_loop(self, event):
        while self._running:
            for name, entry in event._resources.items():
                resource = entry["resource"]
                provider = entry["provider"]
                event._external_resources[name] = {
                    "resource_name": name,
                    "data": provider.save_state(resource),
                    "provider_path": f"{provider.__module__}.{provider.__qualname__}",
                }
            await asyncio.sleep(self.interval)
```

It updates `event._external_resources` in-place every `N` seconds. When `enqueue_checkpoint()` is called, it forces an immediate capture via `capture_now()` before building the snapshot. The checkpoint always sees the latest state.

## Configuring Checkpointing
Checkpointing can be tuned at three levels:

```python
# Project level — config.py
PROJECT_CHECKPOINTING = True
CHECKPOINT_INTERVAL = 30.0       # Seconds between active monitoring
CHECKPOINT_BACKEND = "redis"     # Where checkpoints are stored

# Workflow level — workflow.py
class TradingConfig(WorkflowConfig):
    checkpointing = True
    checkpoint_interval = 10.0    # Override for this workflow

# Event level
class HighFrequencyIngest(EventBase):
    checkpointing = False          # Speed over durability
```

Performance with checkpointing enabled:
Even with checkpointing on, the event pays almost nothing. The snapshot is captured in memory. The queue put is in nanoseconds. The `CheckpointManager` does the I/O asynchronously. The merge optimisation reduces storage writes. For typical workloads, the overhead is negligible.

## Resumption and Lazy Rehydration
When a workflow resumes after a crash or preemption, Volnux uses lazy rehydration:

Strategy:
* Fully rehydrate the current event (the one to resume)
* Replace neighbouring events with `LazyContextProxy` placeholders
* Proxies materialise only when first accessed
* Cache prevents duplicate materialisation

Efficiency comparison:

| System | Resumption Cost |
| :--- | :--- |
| **Airflow/Prefect/Dagster** | O(n) — re-execute completed steps |
| **Temporal** | O(h) — replay full history |
| **Volnux** | O(1) — load one node, proxies for rest |

A 30-day workflow with 100,000 checkpointed steps resumes in the same time as a 30-second workflow. Only the current event is fully loaded. Historical events are proxies that materialize on demand.

## The HealthMonitor
The `HealthMonitor` is a meta-resilience layer — it monitors the monitors:

```python
monitor = HealthMonitor[VolnuxCheckPointManager](
    config=HealthMonitorConfig(
        health_check_interval=10.0,
        max_restart_attempts=3,
    )
)
monitor.register(checkpoint_manager, "checkpoint")
await monitor.start()
```

What it checks:
* Is the `CheckpointManager`'s persistence loop still running?
* Is the queue backing up beyond a threshold?
* Is the storage backend reachable?

What it does:
* Restarts failed managers (up to `max_restart_attempts`)
* Logs failures for operational visibility
* Prevents silent failures where events run, but checkpoints aren't persisted

The `HealthMonitor` is itself a coroutine. It sleeps between checks. Zero resources when idle. If it fails, the process supervisor (systemd, Kubernetes) restarts the entire runtime. On restart, pending checkpoints are recovered from the queue (Redis) or the last persisted state (PostgreSQL).
