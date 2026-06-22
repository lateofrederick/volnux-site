This section explains the fundamental building blocks of Volnux. Understanding these concepts will help you design workflows that are correct, efficient, and governable.

## Events — The Unit of Work
An event is the smallest unit of governed execution in Volnux. It's not a passive task like Airflow's `BaseOperator`. It's a mini-orchestrator with its own mind — a unit of work that manages its own lifecycle, resources, retries, and checkpointing.

Every event must answer one question: "Did I succeed, and what did I produce?" It answers by returning a tuple:

```python
return True, result   # Success with data
return False, error   # Failure with error details
```

Volnux provides two ways to define events: function-based (simple) and class-based (advanced).

### Function-Based Events (@event decorator)
The simplest way to create an event. Decorate a function. Return `(success, result)`. Done.

```python
from volnux import event

@event()
def fetch_data(self):
    data = api.get_trades()
    return True, data

@event(name="ProcessTrades")
def process(self):
    trades = self.previous_result.first()
    processed = [normalize(t) for t in trades.content]
    return True, processed
```

Key points:

* The first argument is always `self` — it provides access to the event's context.
* `@event()` accepts an optional `name` parameter. If omitted, the function name is used.
* The function can be sync (`def`) or async (`async def`). Volnux handles both correctly.
* Use `self.previous_result` to access data from upstream events.

When to use function-based events: Prototyping, simple transformations, I/O operations, API calls. Most workflows can be built entirely with function-based events.

### Class-Based Events (EventBase)
For advanced use cases, subclass `EventBase`. This gives you full control over the event lifecycle, resource management, and executor selection.

```python
from volnux import EventBase

class ValidateTrades(EventBase):
    # Declare the executor for CPU-bound work
    executor = "process"

    # Declare configurable parameters
    INIT_PARAMS_SCHEMA = {
        "threshold": {"type": float, "default": 0.95},
        "strict_mode": {"type": bool, "default": True},
    }

    async def process(self, *args, **kwargs):
        trades = await self.previous_result.first()
        valid = [t for t in trades.content if t["score"] >= self.threshold]
        return True, valid
```

Key points:

* Override `process()` — it must be async.
* `executor_class` declares where this event runs. Options: `DefaultExecutor` (async), `ThreadPoolExecutor`, `ProcessPoolExecutor`, `RustExecutor`, `CythonExecutor`, `RemoteExecutor`.
* `INIT_PARAMS_SCHEMA` declares parameters that can be set in Pointy-Lang annotations.
* Class-based events unlock the full lifecycle: `communicate()`, `bypass()`, `after_process()`, `acquire_resource()`.

When to use class-based events: CPU-bound computation, custom executors, HITL workflows, resources that need checkpointing, agentic AI, reusable event packages.

### The process() Method
`process()` is where your business logic lives. It runs during the PROCESSING phase of the event lifecycle.

```python
async def process(self, *args, **kwargs) -> Tuple[bool, Any]:
    # 1. Get input data
    data = await self.previous_result.first()

    # 2. Do the work
    result = transform(data.content)

    # 3. Return success/failure and result
    return True, result
```

Rules:

* Must be `async def` in class-based events.
* Must return a tuple: `(bool, Any)`.
* The boolean indicates success (`True`) or failure (`False`).
* The second element is your result data. It must be serializable.
* `process()` is for computation. Don't wait for humans here — use `communicate()`.

### Return Contract: (bool, result)
Every event must return a 2-tuple:

| Return | Meaning | Example |
| :--- | :--- | :--- |
| `True, data` | Success with the result | `return True, {"count": 42}` |
| `False, error` | Failure with error | `return False, "Database unreachable"` |
| `False, exception` | Failure with exception | `return False, ValueError("Invalid input")` |

If `process()` returns `None` or forgets to return, Volnux raises `EmptyResultError` with a clear message:

```text
EmptyResultError: The process() method of 'MyEvent' did not return a result.
Every process() method must return a tuple of (success: bool, result: Any).

Example:
    async def process(self, *args, **kwargs):
        data = await self.previous_result.first()
        processed = transform(data)
        return True, processed

Check your implementation and ensure:
  1. The method returns a value (not None)
  2. The first element is a boolean (True/False)
  3. The second element is your result data
```

### Async vs Sync Events
Function-based events can be sync or async. Volnux handles both correctly:

```python
# Sync function — Volnux runs it in a thread pool to avoid blocking
@event()
def sync_event(self):
    result = slow_library_call()  # Blocking call
    return True, result

# Async function — runs directly in the event loop
@event()
async def async_event(self):
    result = await http_client.get(url)  # Non-blocking
    return True, result
```

Class-based events require `async def process()`. If your logic is synchronous and CPU-heavy, declare `executor_class = "ProcessPoolExecutor"` to run in a separate process.

## Pipelines
A Pipeline defines what inputs a workflow accepts and how data flows between events.

### The Pipeline Class
Every workflow has a Pipeline. It declares the typed interface between triggers and workflow execution:

```python
from volnux import Pipeline
from volnux.fields import InputDataField

class TradingPipeline(Pipeline):
    market = InputDataField(data_type=str, required=True, description="Market identifier")
    date = InputDataField(data_type=str, required=False, description="Trading date")
    symbols = InputDataField(data_type=list, default_factory=list, description="Symbol filter")
```

When a trigger fires the workflow with parameters, the Pipeline validates them:

```python
# Trigger passes these param
workflow_params = {"market": "US", "symbols": ["AAPL", "GOOGL"]}

# Pipeline validates:
#   market: "US" → str ✓ (required, present)
#   date: not provided → None (not required, no default)
#   symbols: ["AAPL", "GOOGL"] → list ✓ (default overridden)
```

If validation fails — wrong types, missing required fields — the workflow fails immediately with a clear error. No events executed. The governance guarantee starts at the input boundary.

### Input Data Fields (InputDataField)
Each field in a Pipeline is an `InputDataField`. It declares:

| Attribute | Description | Example |
| :--- | :--- | :--- |
| `data_type` | Python type | `str`, `int`, `list`, `dict` |
| `required` | Must be provided? | `True` or `False` |
| `default` | Fallback value | `[]`, `"US"`, `None` |
| `description` | Human-readable | `"Market identifier"` |
| `default_factory` | Provide dynamic defaults via a function | `default_factory=list` |
| `batch_size` | For batch processing | `50` (split input into batches of 50) |

Batch processing:

```python
class BatchPipeline(Pipeline):
    trades = InputDataField(data_type=list, batch_size=100)
```

When a trigger passes 1000 trades, the Pipeline splits them into 10 batches of 100. The workflow executes 10 times — once per batch. Each execution is independent, parallelizable, and checkpointed separately.

### Typed Inputs and Validation
Pipeline fields are validated at workflow start. This catches configuration errors before any event runs:

```python
# Trigger passes the wrong type
workflow_params = {"market": 123}  # Should be str

# Pipeline raises:
# ValidationError: Field 'market' expected type 'str', got 'int' (value: 123)
```

The validation is performed by `formax-py`, the same model layer that powers Volnux's governance models. It's fast (565ns per validation) and runs before any event executes.

### Batch Pipelines (BatchPipeline)
For workflows that need to run multiple times with different parameters, use `BatchPipeline`:

```python
from volnux import BatchPipeline

class MultiMarketBatch(BatchPipeline):
    pipeline_template = TradingPipeline
    listen_to_signals = []  # Respond to external signals
```

The `BatchPipeline` generates parameter sets. The engine executes the workflow once per set. Each execution is independent — they can run concurrently, and a failure in one doesn't affect others.

`listen_to_signals` declares external signals this batch responds to. When empty, the batch ignores signals. 

## Workflow Configuration
The `WorkflowConfig` class is the single source of truth for a workflow's identity, dependencies, and infrastructure.

### The WorkflowConfig Class
Every workflow has a `WorkflowConfig` subclass:

```python
from volnux.engine.workflows import WorkflowConfig

class TradingConfig(WorkflowConfig):
    name = 'trading'
    version = '2.1.0'
    mode = 'CFG'

    def ready(self):
        # Register triggers, sources, and executors here
        pass
```

Fields:

* `name` — Workflow identifier. Used by CLI, API, and triggers.
* `version` — Semantic version. Enables versioned consumption from EventHub.
* `mode` — `"DAG"` (directed acyclic, no event reuse) or `"CFG"` (control-flow graph, allows event reuse).

### The ready() Hook
`ready()` is called once when the workflow is initialised. It's where you register everything the workflow needs:

```python
def ready(self):
    # Register event sources
    self.register_source(WorkflowSource(
        name="trading-events",
        source_type=RegistrySource.HUB,
        location="company/trading-events",
        version="2.1.0",
    ))

    # Register triggers
    self.register_trigger(ScheduleTrigger(
        cron="0 6 * * MON-FRI",
        workflow_params={"market": "US"},
    ))

    # Register custom executor
    self.executor = CeleryWorkflowExecutor(
        registry=self._workflow_registry,
        broker_url="redis://localhost:6379/0",
    )
```

`ready()` is empty by default. Nothing is implicit. Every dependency, every trigger, every executor must be explicitly declared. An auditor can read `ready()` and see everything the workflow depends on.

### Execution Modes: DAG and CFG
**DAG mode** — Standard directed acyclic graph. Events cannot be reused within the workflow. Each event appears once. This is the simplest mode and matches Airflow/Dagster's model.

**CFG mode** — Control-flow graph. Events can be revisited in different contexts. This enables agent loops, retry scopes, and multi-agent handoffs:

```pointy
AnalystAgent -> {ReviewerAgent, AnalystAgent} -> ApproverAgent
```

`AnalystAgent` executes twice — once before the review, once after, in a different context with different inputs. CFG mode is unique to Volnux among workflow orchestrators.

### Versioning Your Workflow
The `version` field follows semantic versioning. It appears in:

* The EventHub manifest
* Audit trail records
* Execution traces
* Asset materialisation records

When you publish to EventHub, consumers pin to specific versions. Changing the version signals a new release. The deprecation lifecycle in the manifest gives consumers advance warning before breaking changes.

## The Execution Model
Volnux's execution model is built on one principle: orchestration is waiting, computation is doing, and they require different resources.

### Orchestration vs Computation
Every unit of work in Volnux falls into one of two categories:

| | Orchestration | Computation |
| :--- | :--- | :--- |
| **What it does** | Coordinates, waits, routes | Transforms, calculates, processes |
| **CPU usage** | Near zero — mostly I/O | High — CPU-bound |
| **Runs in** | Async coroutines or threads | Processes or native code |
| **Examples** | Triggers, engine, subgraphs, Meta Events | Risk calculation, ML inference, data parsing |
| **Resource cost**| Kilobytes of memory | Process slot (50MB+) |

This distinction is enforced by the Pointy-Lang syntax:

* `{}` — Concurrency groups. Always async/thread. Never processes.
* `||` — Parallel execution. Always processes. Never async.

You cannot accidentally run an orchestrator in a process pool. The language prevents it.

### The Two-Level Dispatcher
Volnux dispatches work at two levels:

**Level 1: Trigger → Workflow.** A trigger fires. It calls `WorkflowExecutor.execute()`. The executor runs the workflow — in-process (async), in a child process, on Celery, or on Kubernetes. The workflow is orchestration — it coordinates events. It runs in async/thread, never a process.

**Level 2: Workflow → Event.** The engine traverses the graph. For each event, it dispatches the declared event to the executor. A `ProcessPoolExecutor` event gets a process. A `RustExecutor` event gets native code with the GIL released. A `DefaultExecutor` event stays in async.

This separation prevents fork bombs. Orchestration never consumes process slots. Only leaf events — actual computation — use processes. The VolnuxPool Manager enforces `W_max = floor(Q_max / R_w)`, capping the maximum number of workers to prevent resource exhaustion.

### Executor Types
Every event declares where it should run:

| Executor | Use Case | Characteristics |
| :--- | :--- | :--- |
| `DefaultExecutor` | I/O-bound events, API calls | Async coroutine shares the event loop |
| `ThreadPoolExecutor`| I/O-bound with blocking libraries | Thread pool, GIL applies |
| `ProcessPoolExecutor`| CPU-bound Python code | Separate process, no GIL |
| `RustExecutor` | Native Rust code via PyO3 | GIL released, microsecond latency |
| `CythonExecutor` | C/C++ library calls | GIL released, high throughput |
| `RemoteExecutor` | Dispatch to another node | P2P mesh, gRPC/TCP/XML-RPC |

Events declare their executor at the class level:

```python
class CalculateRisk(EventBase):
    executor_class = "process"

class FetchPrices(EventBase):
    executor_class = "default"  # I/O-bound API call
```

Or via Pointy-Lang annotations:

```pointy
CalculateRisk[executor="process"] |-> GenerateReport[executor="default"]
```

### The VolnuxPool Manager
The VolnuxPool Manager prevents resource exhaustion:

* Orchestrators (triggers, engine, subgraphs, Meta Events) use async/thread only. They never touch the process pool.
* Leaf events use the executor they declare. Process-bound events share a capped pool.
* `W_max = floor(Q_max / R_w)` — The maximum worker count is dynamically calculated based on available resources.
* Adaptive scaling — The pool expands and contracts based on CPU/memory pressure and queue depth.

No manual tuning. No central scheduler bottleneck. The pool manages itself.

Next step: Head to **Pointy-Lang — The Workflow DSL** to learn the language that defines how events connect.
