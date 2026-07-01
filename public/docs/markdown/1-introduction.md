## What is Volnux?
Volnux is a workflow operating system — not a task scheduler, not an ML platform, not a stream processor. It is the execution substrate, resource management layer, scheduling primitive provider, standard interface definer, and governance infrastructure for workflow-dependent systems across batch, streaming, ML, and agentic AI domains simultaneously.

If you need to run three functions in sequence, you can do that. If you need to orchestrate governed AI agents with human approval steps, sub-event checkpointing, and a complete audit trail, you can do that too. The same runtime. The same abstractions. The same governance guarantees.

Volnux comes in two forms:

* **event-pipeline** — A lightweight library. `pip install event-pipeline`. Decorate functions or subclass the `Event` class. Chain them together. Run. No servers. No infrastructure. Perfect for prototyping, data science, and simple automation.
* **Volnux** — The full platform. CLI tools, project scaffolding, checkpointing, command channel, triggers, streaming, HITL, P2P mesh, EventHub registry, audit trails, break-glass access. Everything you need for production-governed workflows.

Both share the same core execution model. Migration from event-pipeline to Volnux is zero-cost — the same `@event` decorators, the same `EventBase`/`Event` base class and `Pipeline` classes work in both.

## The Operating System Analogy
The operating system analogy is precise: just as an OS does not care what language a process is written in — it schedules processes, manages their resources, handles their I/O — Volnux does not care whether an event is implemented in Python, Cython, or Rust. It schedules events, manages their resources, and handles their I/O.

This distinguishes Volnux from every competitor:

* **Airflow** is a DAG scheduler. It schedules tasks. It doesn't manage their resources or handle their I/O.
* **Prefect** is a flow orchestrator. It coordinates task execution. It doesn't provide a resource management layer.
* **Dagster** is an asset pipeline. It tracks data lineage. It doesn't handle streaming or agentic AI natively.
* **Temporal** is a durable executor. It guarantees exactly-once execution. It doesn't separate orchestration from computation at the resource level.
* **Volnux** is the substrate on which these capabilities are built. It provides the execution model, the resource management, the scheduling primitives, and the governance infrastructure. Workflows, streaming pipelines, and AI agents are all just events executing on the same runtime.

## Why Not An Orchestrator
The term "orchestrator" implies a central conductor directing passive musicians. Volnux inverts this: events are active mini-orchestrators that manage their own lifecycle. The engine coordinates the graph. The events manage themselves.

An Airflow task is a function called by the scheduler. It has no awareness of its own state, no ability to retry itself with domain knowledge, no control over its resources. It executes and returns. The scheduler decides what happens next.

A Volnux event is a self-aware execution unit. It knows what phase of its lifecycle it's in. It manages its own retry policy with exponential backoff and exception-type scoping. It registers resources for checkpointing and cleanup. It responds to commands from the operator, pause at the next safe boundary, checkpoint immediately, cancel gracefully. It communicates with external systems and humans through its `communicate()` hook, suspending fully and releasing all resources while waiting.

This inversion, intelligence in the tasks and coordination in the engine, is what makes Volnux an operating system rather than an orchestrator. The OS schedules processes. The processes manage themselves. Volnux schedules events. The events manage themselves.

## Governance as Foundation
Governance is not a feature in Volnux. It is the foundation.

Every design decision flows from this principle. Four claims back it up:

**Readable by design.** Pointy-Lang is the workflow. What you read is what executes. A compliance officer can review a workflow without opening a terminal or reading Python code.

**Auditable by default.** Every execution produces a complete OpenTelemetry trace. Every event is versioned. Every state transition is checkpointed. The audit trail is a full replay-capable execution record, not a log file.

**Intervenable at every level.** Pause a running workflow. Reroute execution. Replay from a checkpoint with a patched event. No source code reading required. The command channel gives you control over running tasks, not just workflow definitions.

**Composable without chaos.** Teams publish events to a private registry. Other teams consume them by name. No shared codebases. No deployment coordination. No surprise dependencies. The manifest enforces version compatibility and deprecation timelines.

These aren't features added to a workflow engine. They're architectural properties that emerge from building governance infrastructure first and the execution engine second.

## Volnux vs event-pipeline

| Feature | event-pipeline | Volnux |
| :--- | :--- | :--- |
| **Install** | `pip install event-pipeline` | `pip install volnux` |
| **Setup** | Single Python file | `volnux init` scaffold |
| **Events** | `@event` decorator + `EventBase` class | `@event` decorator + `EventBase` class |
| **Workflow definition** | Inline Pointy-Lang string or `.pty` file | `.pty` files or inline |
| **Checkpointing** | No | Yes — configurable |
| **Command channel** | No | Yes — pause, resume, cancel |
| **Triggers** | No | Yes — schedule, event, webhook, etc. |
| **HITL** | No | Yes — human approval with suspension |
| **Streaming** | No | Yes — `\|->` operator with backpressure |
| **Meta Events** | No | Yes — MAP, REDUCE, FILTER, BROADCAST |
| **Governance** | No | Yes — audit trail, manifest, EventHub |
| **Distribution** | No | Yes — remote executors, P2P mesh |
| **Use case** | Prototyping, simple automation | Production-governed workflows |

Choose **event-pipeline** if: You want the simplest possible workflow library. You're prototyping, doing data science, or building a quick automation. You don't need governance, durability, or distributed execution.

Choose **Volnux** if: You need governed, auditable, durable execution. You're deploying to production in a regulated industry. You need human-in-the-loop approval, streaming, or agentic AI with audit trails. You want to publish and consume workflows from a registry.

Migration is zero-cost. Your `@event` functions and `Pipeline` classes work identically in both. Start with event-pipeline. When you need governance, install Volnux and move your code into a project scaffold. No rewrites. No API changes.

## Who Volnux Is For
Volnux is for teams that need governed, auditable, durable execution. If your workflows must survive crashes without restarting from scratch, if your compliance officer needs to review execution paths without reading Python, if your AI agents need tool governance and prompt versioning, if your streaming pipelines need content-aware windowing with audit trails — Volnux is for you.

* **Regulated industries.** Financial services, healthcare, pharmaceuticals, government. Where audit trails are mandatory. Where human approval chains must be documented. Where code changes must be traceable to specific workflow versions.
* **Agentic AI in production.** Where agents must survive crashes without losing reasoning progress. Where tools must be governed — only declared tools may be called. Where prompts must be versioned for auditability. Where token consumption must be tracked and budgeted.
* **Data platform teams.** Where streaming and batch processing must coexist in the same runtime. Where data lineage must be automatic and complete. Where freshness policies must propagate through dependency graphs.
* **Platform engineering teams.** Where workflows must be composable across organizational boundaries. Where event packages must be versioned, documented, and discoverable. Where infrastructure must scale from a single process to a multi-node mesh.

Volnux is not for quick prototypes that will never see production. For those, use event-pipeline — the same core, none of the governance overhead. Volnux is for when the prototype works and now it needs to be governed.

## How Volnux Compares To What You Already Know

### If You're Coming From Airflow
Airflow taught the world that workflows could be defined as code. Its DAG model, operator ecosystem, and scheduler architecture became the standard. But Airflow's architecture has limits:
* **Sensors consume worker slots.** A thousand sensors waiting for files each hold a worker process. Volnux triggers are coroutines — a thousand waiting triggers consume ~50KB total.
* **XCom is limited.** 16MB cap, explicit pull/push, no streaming. Volnux's `previous_result` queryset streams data with memory bounding, supports Django-style filtering, and has no size limit.
* **No checkpointing inside tasks.** A 23-hour task that crashes at hour 22 restarts from hour 0. Volnux checkpoints inside events — resume from the exact phase where you left off.
* **No command channel.** You can't pause a running task. You can clear it in the UI, which kills it. Volnux lets you pause at the next safe boundary, inspect state, and resume.
* **Centralized scheduler is a SPOF and bottleneck.** Volnux has no centralized scheduler.

**The migration path:** DAG → Pointy-Lang `.pty` file. Operator → `EventBase` subclass. XCom → `previous_result` queryset. Sensor → ConditionalTrigger or EventTrigger.

### If You're Coming From Prefect
Prefect prioritized developer experience. `@flow` and `@task` decorators made workflows feel like Python. Prefect Cloud made deployment simple. But Prefect's runtime-inferred graph cannot offer static analysis, Canvas UI, or compliance readability.
* **Runtime-inferred graph means the workflow structure is discovered during execution.** Volnux's static graph is known at parse time — every possible path is visible before anything runs.
* **Task-level caching vs sub-event checkpointing.** Prefect caches task results. Volnux checkpoints inside events.
* **No streaming, no command channel, no HITL.** Prefect's execution model is batch-oriented. Volnux handles streaming, human interaction, and runtime control.

**The migration path:** `@flow` → `WorkflowConfig` + `.pty` file. `@task` → `@event` decorator or `EventBase` subclass. Prefect automations → Volnux triggers.

### If You're Coming From Temporal
Temporal set the standard for durable execution. Its deterministic replay model guarantees exactly-once semantics. But the determinism constraint is a real burden — `NonDeterministicWorkflowError` is a common production failure.
* **Determinism required vs not required.** Temporal workflows cannot call `datetime.now()`, `random()`, or any external API directly. Volnux has no such constraint. The checkpoint captures actual state, not instructions to recreate it.
* **O(h) replay vs O(1) resumption.** Temporal replays the full history to rebuild state. Volnux loads one node with lazy proxies for the rest. A 30-day workflow resumes in constant time.
* **Activity boundary vs sub-event checkpointing.** Temporal checkpoints at activity boundaries. A 23-hour activity that crashes at hour 22 restarts from hour 0. Volnux checkpoints inside events.
* **Flat history log vs fractal tree.** Temporal's history is append-only, forward-only. Volnux's fractal tree is bidirectional — traverse backward to find root causes, forward to replay from any node.

**The migration path:** Workflow → `WorkflowConfig` + `.pty` file. Activity → `EventBase` subclass. Signal → Command channel command. Child Workflow → `{}` subgraph or deferred task.

### If You're Coming From Spark or Beam
Spark and Beam process data at petabyte scale. They're distributed computation engines. Volnux is a governed execution platform. The overlap is streaming data processing.
* **Spark's driver is a centralized coordinator.** Every task placement, retry decision, and stage boundary flows through it. Volnux has no centralized coordinator — every node runs the full runtime.
* **Beam's windowing is pervasive.** Every transform after `WindowInto` is window-aware. Volnux's `WindowedTrigger` contains the window. The workflow receives a batch and processes it without window awareness.
* **Shuffle vs query pushdown.** Spark shuffles elements across workers by key — network-intensive, O(n). Volnux pushes `filter(name="AAPL")` to the database index — O(log n), no network transfer.
* **Governance.** Spark and Beam have no audit trail, no versioning, no HITL, no command channel. Volnux provides all of these.

Volnux is not faster than Spark at petabyte-scale ETL. It's more governable for the workloads where governance matters.

### If You're Coming From LangGraph, CrewAI, or AutoGen
These frameworks make it easy to build AI agents. But they're designed for experimentation, not production governance.
* **No durability.** Process crash = agent state lost. Restart from scratch. Volnux agents checkpoint at every reasoning step — resume from the last step, not step zero.
* **No tool governance.** Any function in scope can be called. Volnux enforces that only declared tools may be invoked — `ToolPermissionError` is a security event recorded in the audit trail.
* **No prompt versioning.** Prompts are strings in code. Volnux stamps `prompt_version` into every reasoning step and the EventHub manifest.
* **No HITL suspension.** LangGraph's `interrupt()` holds the thread. Volnux's `communicate()` suspends fully — zero resources held while waiting for human input.
* **No command channel.** You can't pause an agent mid-reasoning. Volnux lets you pause at the next reasoning step, inspect state, and resume.

**The migration path:** Agent → `AgentEventBase` subclass. Tool → `EventBase` subclass (full lifecycle, executor dispatch, checkpointing). Handoff → `goto()` with `permitted_handoffs`.

## Core Design Philosophy
Volnux is built on four principles discovered from production experience, not abstract design.

### Complexity Absorbed by the Framework, Simplicity Surfaced to the User
Every piece of complexity in Volnux exists to eliminate a piece of complexity for the user. The Fractal Execution Tree means the user never thinks about recovery. The command channel means the user never writes circuit-breaking code. The GlobalPool Manager means the user never tunes worker counts. The EventHub manifest means the user never manages dependency conflicts. The `previous_result` queryset means the user never writes data-passing boilerplate. Pointy-Lang operators mean the user never thinks about concurrent execution primitives. The `communicate()` hook means the user never thinks about state restoration for HITL.

The simplicity is not despite the complexity. The simplicity is because of it.

### Intelligence Lives in Tasks, Not Coordinators
Retry decisions belong to the task — only it knows which exceptions are transient for its domain. Resource lifecycle belongs to the task — only it knows when a file handle can be safely closed. The pause gate belongs to the task — only it knows where a safe pause boundary exists. Failure classification belongs to the task — only it knows whether an error is recoverable or fatal.

The coordinator traverses the graph and dispatches events to their declared executors. It doesn't make decisions that require execution context. This is why Volnux can operate peer-to-peer without a central scheduler — every node runs the full runtime, and tasks carry their own intelligence.

## Quick Start
Install Volnux:

```bash
pip install volnux
```

Create a project and run your first workflow in under five minutes:

```bash
volnux init my_project
cd my_project
volnux workflow init hello_world
```

Edit `workflows/hello_world/events.py`:

```python
from volnux import event

@event()
def greet(self):
    return True, "Hello, Volnux!"
```

Edit `workflows/hello_world/helloworld.pty`:

```pointy
greet
```

Run it:

```bash
volnux workflow run hello_world
```

You should see `Hello, Volnux!` in your terminal.

That's it. You've written, validated, and executed a governed workflow. From here, you can:

* Add more events and chain them with `->`
* Add triggers to run on a schedule
* Add human approval steps
* Publish to EventHub for other teams to consume
* Deploy to Kubernetes or a Celery cluster

Each step adds capability without changing the foundation. The `@event` decorator you started with is the same one that powers production-governed workflows. Start simple. Grow as needed. The platform scales with you.
