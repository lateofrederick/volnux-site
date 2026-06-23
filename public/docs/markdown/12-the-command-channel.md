The command channel is Volnux's mechanism for runtime control of executing events. It enables operators to pause, resume, cancel, and inspect running workflows — not just workflow definitions, but individual events mid-execution. This is unique among workflow orchestrators.

## PAUSE / RESUME
A running workflow can be paused at any event boundary. The event completes its current phase, checkpoints, and releases all resources. The workflow waits until resumed.

```bash
volnux workflow pause trade-reconciliation
```

What happens:
* The command propagates through the P2P mesh to the node executing the workflow.
* The workflow engine receives the command and forwards it to the currently executing event via the command channel.
* The event finishes its current lifecycle phase (completes the current `process()` invocation, or finishes waiting in `communicate()`).
* The event checkpoints — full state snapshot including all resources.
* The event's executor slot is released. Zero resources held.
* The workflow engine records the pause in the `ExecutionContext`.
* The OTel span is updated with the pause event.

Resume:

```bash
volnux workflow resume trade-reconciliation
```

* The `RehydrationManager` loads the event's checkpoint snapshot.
* Resources are restored — file handles reopened at the correct offset, database connections re-established.
* The event resumes from the exact phase where it was paused.
* If paused during `communicate()`, the HITL response (if received during pause) is injected into `previous_result`.
* Execution continues as if nothing happened.

**Pause during HITL:** If a workflow is paused while waiting for human approval, the pending HITL request remains in Redis. The human can still respond during the pause. The response waits in the queue. When the workflow resumes, the response is delivered.

## CANCEL
Cancel terminates a workflow permanently. Unlike pause, cancel is irreversible.

```bash
volnux workflow cancel trade-reconciliation
```

What happens:
* The command propagates to the executing event.
* The event's current phase is interrupted.
* Resources are cleaned up — file handles closed, connections released.
* If a HITL request is pending, it's removed from Redis. The human is notified that approval is no longer needed.
* The event's checkpoint is marked as cancelled.
* The `ExecutionContext` records the cancellation.
* The workflow transitions to CANCELLED state.

Cancel with reason:

```bash
volnux workflow cancel trade-reconciliation --reason "System migration — workflow superseded"
```

The reason is recorded in the audit trail. Compliance officers can see why the workflow was cancelled and who cancelled it.

## CHECKPOINT
Force an immediate checkpoint of a running event. Useful before maintenance windows or risky operations.

```bash
volnux workflow checkpoint trade-reconciliation
```

What happens:
* The command is delivered to the currently executing event.
* The event immediately captures its full state — all variables, resources, phase, retry count.
* The `ResourceMonitor` forces a `capture_now()` on all registered resources.
* The snapshot is enqueued to the `CheckpointManager` with high priority.
* The `CheckpointManager` persists it immediately (bypasses merge, writes directly).
* Confirmation is returned to the operator.

This is a synchronous checkpoint — the operator knows the state is persisted before proceeding with maintenance.

## UPDATE_PRIORITY
Change the priority of a running workflow. Higher priority workflows get preferential access to executor slots.

```bash
volnux workflow priority trade-reconciliation --level high
```

Priority levels: `low`, `normal`, `high`, `critical`

Effect:
* The GlobalPool Manager re-evaluates task scheduling.
* Higher priority events are dispatched before lower priority ones.
* If all executor slots are occupied, a lower-priority event may be preempted to make room.
* Preempted events are checkpointed and resumed when slots become available.

## Command Propagation in Subgraphs
When a workflow contains `{}` subgraphs or Meta Events, commands propagate through the hierarchy:

```d2
direction: down

WE: Workflow Engine\n(receives PAUSE)
EA: Event A (running)\nreceives PAUSE, checkpoints, pauses

Subgraph: "{} Subgraph (running)" {
  direction: down
  SE: Sub-Engine\n(receives PAUSE from parent)
  EB: Event B (running)\nreceives PAUSE, checkpoints, pauses
  EC: Event C (running)\nreceives PAUSE, checkpoints, pauses
  
  SE -> EB
  SE -> EC
}

WE -> EA
WE -> Subgraph
```

A single `volnux workflow pause` pauses the entire workflow tree. The command flows from parent to children through the `ExecutionContext` hierarchy. Every event in every subgraph checkpoints and releases resources.

Resume reverses the process: The workflow engine resumes. The subgraph resumes. Each event in the subgraph resumes from its checkpoint. The fractal tree is restored.

## Child Command Channels (Tools and Agents)
When an `AgentEventBase` executes a tool, the tool is itself an `EventBase` instance. It gets its own command channel — a child channel scoped to the tool's task ID.

```python
def _create_child_channel(self, tool_task_id: str):
    if self._command_channel is None:
        return None
    # Create a new channel of the same concrete type
    return type(self._command_channel)(tool_task_id)
```

**Why a separate channel:** If the tool shared the agent's command channel, the tool's completion would cancel the channel's listener. The agent would lose its command channel. A child channel isolates the tool's lifecycle from the agent's.

Command routing:

```python
async def _handle_command(self, command: TaskCommand) -> None:
    if command.task_id != self._task_id:
        # This command is for a tool — forward to its child channel
        await self._forward_tool_command(command.task_id, command)
        return
    
    # Command addressed to this agent — handle normally
    await super()._handle_command(command)
```

The agent inspects the command's `task_id`. If it's for a tool, the agent forwards it. If it's for the agent itself, the agent handles it. The command channel infrastructure handles the routing transparently.

What this enables:
* Pause an agent mid-reasoning — the agent checkpoints at the next reasoning step.
* Cancel a running tool without cancelling the agent — the tool is cancelled, the agent handles the error and continues.
* Checkpoint an agent during a tool call — the agent's state and the tool's state are both captured.

## Command Channel Implementation
The command channel is an abstract interface with pluggable backends:

```python
class CommandChannelBase(ABC):
    def __init__(self, task_id: str):
        self.task_id = task_id
    
    async def send_command(self, command: TaskCommand) -> None: ...
    async def receive_command(self, timeout=None) -> Optional[TaskCommand]: ...
    async def send_message(self, message: TaskMessage) -> None: ...
    async def receive_message(self, timeout=None) -> Optional[TaskMessage]: ...
```

Backend implementations:
* `LocalChannel`: In-process `asyncio.Queue`. For single-node deployments.
* `GRPCChannel`: gRPC streaming. For P2P mesh communication.
* `RedisChannel`: Redis pub/sub. For multi-node deployments with a shared Redis.

The backend is selected based on deployment topology. The event code is identical regardless of backend — it sends and receives commands through the same interface.

`TaskCommand` structure:

```python
@dataclass
class TaskCommand:
    task_id: str
    command_type: CommandType  # PAUSE, RESUME, CANCEL, CHECKPOINT, UPDATE_PRIORITY
    payload: Dict[str, Any]
    timestamp: float
```

`TaskMessage` structure:

```python
@dataclass
class TaskMessage:
    task_id: str
    message_type: MessageType  # STATUS, PROGRESS, ERROR
    payload: Dict[str, Any]
    timestamp: float
```

Commands flow from operators to events. Messages flow from events to operators. The channel is bidirectional.

## CLI Integration
The command channel is exposed through the CLI and REST API:

```bash
# Workflow control
volnux workflow pause <name>
volnux workflow resume <name>
volnux workflow cancel <name>
volnux workflow checkpoint <name>
volnux workflow priority <name> --level high

# Status inspection
volnux workflow status <name>

# Output:
# Workflow: trade-reconciliation
# Status: PAUSED
# Current event: ValidateTrade (phase: PROCESSING, 67% complete)
# Paused at: 2024-06-19T14:32:00Z
# Resources held: 0 (fully released)
```

REST API:

```text
POST /api/v1/workflows/{name}/pause
POST /api/v1/workflows/{name}/resume
POST /api/v1/workflows/{name}/cancel
GET  /api/v1/workflows/{name}/status
```

## The Pause Gate
Events check a pause gate before each step in `process()`. This enables cooperative pausing — the event pauses at a safe boundary, not in the middle of a computation:

```python
async def _run_agent_loop(self, **kwargs):
    while self._step_index < self.max_reasoning_steps:
        await self._pause_gate.wait()  # Blocks if paused
        
        response = await self._call_llm()
        action = self._parse_action(response)
        
        await self.enqueue_checkpoint()  # Safe to pause after checkpoint
        
        self._step_index += 1
```

The pause gate is an `asyncio.Event`. When clear, `wait()` returns immediately. When set (paused), `wait()` blocks until the gate is cleared (resumed). The event checks the gate at natural boundaries — between reasoning steps, between batches, between API calls. The pause is cooperative, not preemptive.
