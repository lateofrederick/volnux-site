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
