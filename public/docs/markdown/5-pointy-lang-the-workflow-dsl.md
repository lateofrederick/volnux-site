Pointy-Lang is the domain-specific language for defining workflows in Volnux. It's not a general-purpose programming language. It's not Python with a different syntax. It's a declarative language for expressing how events connect, branch, stream, and execute.

## Why Pointy-Lang?
Most workflow tools define their graphs in Python code. Airflow uses `>>` operators on task objects. Prefect uses `@flow` and `@task` decorators. Dagster uses `@asset` dependencies. Temporal uses imperative code with `execute_child_workflow`.

Volnux uses Pointy-Lang for one reason: governance through readability.

A Pointy-Lang file is the workflow. What you read is what executes. A compliance officer can review a `.pty` file without understanding Python. The graph is static and complete at parse time — the engine knows every possible execution path before anything runs.

This enables:

* **Canvas UI** — Visualise the graph for non-technical reviewers
* **Parse-time validation** — Catch errors before execution
* **Static analysis** — Verify governance properties (no cycles, no disallowed patterns)
* **Compliance readability** — The workflow definition is an auditable artefact

## Basic Syntax
Pointy-Lang is whitespace-insensitive. Operators connect events. Events are referenced by name.

### Sequential Execution (->)
The arrow operator runs events one after another. The second event starts only after the first completes successfully.

```pointy
FetchData -> ProcessData -> SaveResults
```

`FetchData` runs. When it returns `(True, result)`, `ProcessData` runs. When `ProcessData` completes, `SaveResults` runs.

If any event returns `(False, error)`, execution stops. The error propagates. The workflow fails.

### Streaming Pipe (|->)
The streaming pipe enables memory-bounded data flow between events. Downstream events can begin processing before upstream events complete.

```pointy
FetchTrades |-> ProcessTrades |-> SaveTrades
```

For 10 million trades with `batch_size=50`:

* `FetchTrades` produces results in batches
* `ProcessTrades` begins processing batch 1 while `FetchTrades` produces batch 2
* `SaveTrades` writes batch 1 while `ProcessTrades` processes batch 2
* Peak memory: 50 records × pipeline depth (3 events) = 150 records in flight

Without streaming (`->`), all 10 million records would be materialised before `ProcessTrades` starts.

When to use `|->`:
* Large datasets that don't fit in memory
* Pipelines where downstream work can start before upstream completes
* Continuous processing of event streams

When to use `->`:
* When execution order must be strictly sequential
* When the data stream is not required

### Parallelism (||)
The double-pipe operator runs events in parallel. Each event gets its own process. They execute simultaneously on different CPU cores.

```pointy
CalculateRisk || GenerateReport || NotifyOperator
```

All three events start at the same time. The workflow continues when all three complete. Each runs in a `ProcessPoolExecutor` by default — true parallelism, no GIL contention.

`||` is for CPU-bound work. Events that compute, transform, or process data benefit from dedicated processes. Events that wait (API calls, database queries) should use `{}` instead.

### Concurrency Groups ({})
Curly braces create concurrent execution groups. Events inside `{}` run concurrently as coroutines or threads — lightweight, cooperative, sharing the event loop.

```pointy
{FetchPrices, FetchNews, FetchVolumes} -> AnalyzeMarket
```

All three fetch operations run concurrently. They yield to each other during I/O. When all complete, `AnalyzeMarket` runs with all three results available.

Chains inside groups:

```pointy
{
    FetchPrices -> ValidatePrices -> EnrichPrices,
    FetchNews -> FilterNews
} -> AnalyzeMarket
```

Two chains run concurrently. Chain 1: three events in sequence. Chain 2: two events in sequence. Both chains start at the same time. `AnalyzeMarket` waits for both chains to complete.

`{}` is for I/O-bound work. Events that make API calls, query databases, wait for external services. They don't need dedicated processes. They yield cooperatively.

### || vs {} — When to Use Which
This distinction is fundamental to Volnux's execution model:

| | `||` | `{}` |
| :--- | :--- | :--- |
| **Execution** | True parallelism | Cooperative concurrency |
| **Resource** | Process pool | Async/thread pool |
| **Use case** | CPU-bound events | I/O-bound events, orchestrators |
| **GIL** | Released (separate processes) | Not an issue (async) |
| **Overhead** | Process spawn + serialisation | Coroutine creation (negligible) |
| **Can contain** | Single events only | Events, chains, nested `{}` |
| **Cannot contain**| `{}` subgraphs, orchestrators | `||` parallel events |

The rule: `{}` can contain `||` at the leaf level. `||` cannot contain `{}`.

```pointy
# Valid: {} contains || at leaf level
{A || B, C -> D}

# Invalid: || contains {} orchestrator
A || {B, C}  # Error: orchestrator cannot be a process
```

If you try to nest `{}` inside `||`, the parser rejects it at compile time. The error message explains why and shows the correct syntax.

### Conditional Branching (())
Parentheses define conditional branches based on a preceding event's result.

```pointy
ValidateTrade (
    0 -> ApproveTrade -> ExecuteTrade,
    1 -> RejectTrade -> NotifyClient,
    2 -> EscalateTrade -> NotifyManager
)
```

`ValidateTrade` runs first. Based on its result:

* Descriptor 0 (success): `ApproveTrade -> ExecuteTrade`
* Descriptor 1 (failure): `RejectTrade -> NotifyClient`
* Descriptor 2 (error/timeout): `EscalateTrade -> NotifyManager`

The event signals which branch to take via `self.goto()`:

```python
class ValidateTrade(EventBase):
    async def process(self, *args, **kwargs):
        trade = await self.previous_result.first()
        if trade.content["valid"]:
            self.goto(0, True, trade)    # Branch 0
        elif trade.content["review"]:
            self.goto(1, False, trade)   # Branch 1
        else:
            self.goto(2, False, trade)   # Branch 2
```

Or the engine follows the normal success/failure path based on the event's return value:

```python
return True, trade   # → Branch 0 (success)
return False, error  # → Branch 1 (failure)
```

### Annotations ([])
Square brackets pass configuration parameters to events. These map to the event's `INIT_PARAMS_SCHEMA` or are passed as options:

```pointy
CalculateRisk[
    executor="rust",
    confidence=0.95,
    timeout=30.0
]
```

The `executor` parameter is special — it declares which executor to use. All other parameters are passed to the event's options and available via `self.options.extras`:

```python
class CalculateRisk(EventBase):
    async def process(self, *args, **kwargs):
        confidence = self.options.extras.get("confidence", 0.95)
        timeout = self.options.extras.get("timeout", 60.0)
        # ...
```

For deferred tasks (events defined on remote nodes), annotations specify the connection:

```pointy
CalculateProfit[
    executor="grpc",
    executor_config={"host": "compute-node.internal", "port": 45545}
]
```

### Retry (*)
The `*` operator is for retry.

```pointy
FetchData * 3 -> ProcessData
```

`FetchData` executes. If it fails, it retries up to 3 times. If it succeeds within those attempts, execution continues to `ProcessData`. If all retries are exhausted, the workflow fails.
The number after `*` is the maximum retry count. If omitted, the event's default retry policy applies.

```pointy
ApiCall * 5 -> ProcessResult

# Retry using event's default retry policy
ApiCall * -> ProcessResult
```

### Null Coalescing (??)
The `??` operator provides default values for variable access.

```pointy
@environ=$env.ENVIRONMENT ?? "production"
@timeout=$env.TIMEOUT ?? 30.0
```

## Nested Subgraphs
Curly braces can be nested to any depth. Each nesting level creates a new orchestration context.

```pointy
A -> {
    B -> {C, D},
    E -> {F -> {G, H}}
} -> I
```

Execution tree:
```text
A
└── {} (subgraph 1)
    ├── B -> {} (subgraph 2)
    │   ├── C (concurrent)
    │   └── D (concurrent)
    └── E -> {} (subgraph 3) -> {} (subgraph 4)
            ├── G (concurrent)
            └── H (concurrent)
I
```

Each `{}` is a `SubgraphControlFlow` — a lightweight engine that coordinates its children. Subgraphs inherit the execution context. Results flow upward. The fractal execution tree is preserved in the audit trail.

## Event Reuse in CFG Mode
In CFG mode, the same event can appear multiple times in different contexts.

```pointy
AnalystAgent -> {ReviewerAgent, AnalystAgent} -> ApproverAgent
```

`AnalystAgent` runs twice:
* Before the review — initial analysis with raw data
* After `ReviewerAgent` — revised analysis with reviewer feedback

Each execution is a separate task with its own checkpoint, lifecycle, and result. CFG mode enables agent loops, retry scopes, and multi-agent handoffs without a loop construct in the language.

## Deferred Tasks (Remote Events)
A deferred task is an event that is not defined locally. It exists on another node. The Pointy-Lang file references it by name with a remote executor annotation:

```pointy
LoadData -> CalculateProfit[
    executor="grpc",
    executor_config={"host": "compute-node.internal", "port": 45545}
] -> GenerateReport
```

`CalculateProfit` is not in the local `events.py`. The `GRPCExecutor` packages the event name and parameters, sends them to `compute-node.internal:45545`, and waits for the result. The remote node's `RemoteManager` receives the request, executes `CalculateProfit` locally, and returns the result.

The workflow spans nodes transparently. The audit trail records which node executed which event. The OTel trace propagates across the network boundary.

## Meta Events
Meta Events are higher-order events that orchestrate other events. They wrap a Template Event and execute it multiple times based on input data. Think of them as declarative loop operations — `MAP`, `FILTER`, `REDUCE`, and others — that process collections with familiar functional programming patterns.

### What Are Meta Events?
A Meta Event takes an event class as a template and applies it to items in a collection. The result is a new collection passed to the next stage.

Syntax:
```pointy
MODE<TemplateEvent>[attributes]
```

Key concept: Meta Events follow a monadic design:
`Collection → [Meta Event + Template] → Collection → [Next Meta Event]`

Each Meta Event takes a collection as input, applies a Template Event to items in the collection, outputs a (potentially transformed) collection, and passes it to the next stage. This is why nested Meta Events are not allowed — it would create semantic ambiguity about what the inner Meta Event operates on.

```pointy
# ❌ Invalid — ambiguous: filter what? The item or items within?
MAP<FILTER<ProcessItem>>

# ✅ Valid — clear sequential composition
MAP<Transform> |-> FILTER<Validate>
```

### MAP — Apply to Each Item
Execute a Template Event for each item in a collection.

```pointy
@items = [1, 2, 3, 4, 5]
LoadItems[collection=$items] |-> MAP<ProcessItem> |-> SaveResults
```

What happens:
* `ProcessItem` runs 5 times (once per item)
* Each execution gets one item as input
* Results are collected into a list
* The output list is passed to `SaveResults`

With attributes:
```pointy
MAP<ProcessItem>[
    batch_size=10,
    concurrent=true,
    retry_attempts=3
]
```

### FILTER — Keep Matching Items
Keep only items where the Template Event returns descriptor 1. Items where the event returns descriptor 0 are excluded.

```pointy
@users = [
    {"name": "Alice", "age": 25},
    {"name": "Bob", "age": 17},
    {"name": "Charlie", "age": 30}
]
LoadUsers |-> FILTER<IsAdult> |-> ProcessAdults
```

What happens:
* `IsAdult` runs for each user
* Returns descriptor 1 (include) or 0 (exclude)
* Output contains only users where `IsAdult` returned 1
* Filtered list is passed to `ProcessAdults`

### REDUCE — Combine Into Single Result
Combine all items into a single result through sequential accumulation.

```pointy
@numbers = [1, 2, 3, 4, 5]
REDUCE<Sum>[initial_value=0, collection=$numbers] -> DisplayTotal
```

What happens:
* Start with `initial_value` (0)
* Process first item: 0 + 1 = 1
* Process second item: 1 + 2 = 3
* Process third item: 3 + 3 = 6
* Continue until final result: 15
* Single result (15) is passed to `DisplayTotal`

Unlike `MAP` which can process items concurrently, `REDUCE` processes items sequentially — each invocation receives the previous invocation's result.

### FOREACH — Execute for Side Effects
Execute a Template Event for each item, but discard the results. The original collection passes through unchanged.

```pointy
@users = [{"id": 1}, {"id": 2}, {"id": 3}]
LoadUsers[collection=$users] |-> FOREACH<SendNotification> |-> LogCompletion
```

What happens:
* `SendNotification` runs for each user
* Results are ignored
* Original users list passes through to `LogCompletion`

Use cases: Logging, notifications, audit trails, cache updates — any side effect where you want to keep the original data flowing.

### FLATMAP — Transform and Flatten
Apply a Template Event that returns a list for each item. All lists are flattened into a single output list.

```pointy
@categories = ["electronics", "books", "clothing"]
LoadCategories[collection=$categories] |-> FLATMAP<FetchProductsInCategory> |-> ProcessAllProducts
```

What happens:
* `FetchProductsInCategory` returns a list for each category
* All lists are flattened into a single list
* Example: `[[prod1, prod2], [prod3], [prod4, prod5]]` → `[prod1, prod2, prod3, prod4, prod5]`
* Flattened list is passed to `ProcessAllProducts`

Use cases: One-to-many transformations — expanding categories into products, expanding orders into line items, expanding documents into paragraphs.

### FANOUT — Broadcast to N Instances
Send the same input to multiple instances of the same event. All instances receive identical input and execute independently.

```pointy
@request = {"data": "payload"}
PrepareRequest[request=$request] |-> FANOUT<SendToReplica>[count=3, concurrent=true] -> AggregateResponses
```

What happens:
* Same request sent to 3 replica instances
* All execute in parallel (if `concurrent=true`)
* Results collected from all instances
* All results passed to `AggregateResponses`

Use cases: Replication across systems, consensus validation (send to N validators, compare results), parallel processing of the same data with different configurations.

### Passing Collections to Meta Events
There are three ways to pass collections to Meta Events:

**Option 1: Pipe from previous event**
```pointy
LoadUsers |-> MAP<ProcessUser> |-> SaveResults
```
The collection flows from `LoadUsers` through the pipe to `MAP`.

**Option 2: Explicit collection attribute**
```pointy
@users = [{"id": 1}, {"id": 2}]
MAP<ProcessUser>[collection=$users]
```
The collection is declared directly in the annotation.

**Option 3: Both (explicit overrides piped)**
```pointy
@explicit_users = [{"id": 99}]
LoadUsers |-> MAP<ProcessUser>[collection=$explicit_users]
```
When both are present, the explicit collection attribute takes priority over the piped input. In this example, `MAP` uses `$explicit_users`, not the output from `LoadUsers`.

### Meta Event Attributes
Meta Events support two distinct levels of attributes:

**Meta-Level Attributes** — Control the Meta Event itself:

| Attribute | Type | Description | Applies To |
| :--- | :--- | :--- | :--- |
| `batch_size` | `int` | Items per batch | `MAP`, `FILTER`, `FOREACH`, `FLATMAP` |
| `concurrent` | `bool` | Enable parallel execution (default: `true`) | `MAP`, `FILTER`, `FOREACH`, `FLATMAP`, `FANOUT` |
| `max_workers` | `int` | Maximum parallel executions (default: `4`) | `MAP`, `FILTER`, `FOREACH`, `FLATMAP`, `FANOUT` |
| `concurrency_mode`| `str` | `"thread"` or `"process"` | All |
| `count` | `int` | Number of instances | `FANOUT` only |
| `initial_value` | `any` | Starting accumulator value | `REDUCE` only |
| `collection` | `list` | Items to process | All |
| `partial_success` | `bool` | Allow partial failures (default: `false`) | All |

**Template-Level Attributes** — Inherited by each template event instance:

| Attribute | Type | Description |
| :--- | :--- | :--- |
| `retry_attempts` | `int` | Retry count per instance |
| `executor` | `str` | Executor type for each instance |
| `stop_condition` | `list` | Conditions under which to stop |
| `bypass_event_checks`| `bool` | Check skip conditions (default: `false`) |
| `result_evaluation_strategy`| `str` | Strategy for task result evaluation |

Example with both levels:
```pointy
MAP<ProcessItem>[
    batch_size=10,                    # Meta-level
    concurrent=true,                  # Meta-level
    retry_attempts=3,                 # Template-level (inherited by each ProcessItem)
    executor="thread",                # Template-level (inherited by each ProcessItem)
]
```

### Chaining Meta Events
Combine multiple Meta Events in sequence for complex data pipelines:

```pointy
LoadData |-> MAP<Parse> |-> FILTER<Validate> |-> REDUCE<Aggregate> -> PublishResults
```

Flow:
* `LoadData` returns a collection
* `MAP<Parse>` transforms each item
* `FILTER<Validate>` keeps only valid items
* `REDUCE<Aggregate>` combines into a single result
* `PublishResults` receives the final result

### Error Handling
Control how failures are handled with `partial_success` and conditional branching:

```pointy
MAP<ProcessItem>[partial_success=true, retry_attempts=3] (
    0 -> HandleErrors,     # Some or all items failed
    1 -> SaveResults       # All items succeeded
)
```
* `partial_success=false` (default): If any item fails, the entire Meta Event fails.
* `partial_success=true`: The Meta Event succeeds even if some items fail. Failed items are collected. Successful items are passed through. The branch descriptor determines where results flow.

Example with detailed error handling:
```pointy
@items = [1, 2, 3, 4, 5]
LoadItems[collection=$items] |->
MAP<ProcessItem>[
    concurrent=true,
    partial_success=true,
    retry_attempts=2
] (
    0 -> LogFailures -> NotifyAdmin,
    1 -> ValidateResults -> SaveToDatabase
)
```

### Important Restrictions
**No Nested Meta Events.** Meta Events follow a monadic design where each takes a collection and returns a collection. Nesting creates semantic ambiguity about what the inner Meta Event operates on.

```pointy
# ❌ INVALID
MAP<FILTER<ProcessItem>>

# ✅ VALID
MAP<Transform> |-> FILTER<Validate>
```

**Meta Events are orchestrators.** They always run in async/thread, never in processes. The template events they orchestrate run in whatever executor they declare.

**Meta Events cannot be templates.** A Meta Event cannot be used as a template for another Meta Event. This is validated at parse time.

### Complex Example
A complete ETL pipeline using Meta Events:

```pointy
@batch_size = 50
@retry_count = 3

FetchRawData |->
MAP<ParseRecord>[
    batch_size=$batch_size,
    concurrent=true,
    retry_attempts=$retry_count
] (
    0 -> LogParseErrors -> NotifyDataTeam,
    1 -> FILTER<ValidateSchema>[concurrent=true] |->
         MAP<TransformToTargetFormat>[concurrent=true] |->
         REDUCE<BatchInsert>[batch_size=100] (
             0 -> RollbackChanges -> AlertAdmin,
             1 -> CommitTransaction -> SendSuccessNotification
         )
)
```

What happens:
* `FetchRawData` produces raw records
* `MAP<ParseRecord>` parses them in batches of 50 with 3 retry attempts per batch. Parse failures route to error handling.
* `FILTER<ValidateSchema>` keeps only valid records
* `MAP<TransformToTargetFormat>` transforms each record
* `REDUCE<BatchInsert>` accumulates records and batch-inserts them. Insertion failures trigger rollback.

The entire pipeline is expressed declaratively. The governance guarantees — checkpointing, retry, audit trail — apply at every level.

## Directives
Directives are special configuration commands that control how the Pointy-Lang parser interprets and executes your workflow. They are declared at the beginning of a `.pty` file and affect the entire workflow globally.

### Directive Syntax
Directives start with the `@` symbol and must appear before any event expressions:

```pointy
@directive_name: value

# Event expressions follow
LoadData -> ProcessData -> SaveData
```

Rules:
* Directives must appear at the top of the file, before any event expressions
* Each directive can be specified only once (duplicates emit a warning; the last value wins)
* Directive values are parsed at compile time
* Invalid directive values cause parse-time errors

### Mode Directive (@mode)
The mode directive tells Pointy-Lang how to interpret the structure of your workflow.

```pointy
@mode: "DAG"
@mode: "CFG"

# Aliases
@mode: "strict"      # Alias for DAG
@mode: "flexible"    # Alias for CFG
```

**DAG Mode (Directed Acyclic Graph)**
DAG mode prohibits event reuse. Each event can appear only once in the graph. This is the simplest mode — linear, predictable, and matching the execution model of Airflow, Dagster, and Prefect.

```pointy
@mode: "DAG"
FetchData -> ProcessData -> SaveData -> SendNotification
```

What DAG mode prevents:
```pointy
@mode: "DAG"
A -> B (
    0 -> C,
    1 -> A  # ERROR: Cannot reuse event A in DAG mode
)
```

When to use DAG mode:
* Data pipelines with linear flow
* ETL processes (extract, transform, load)
* Approval workflows with linear chains
* Any workflow where events should execute exactly once

**CFG Mode (Control Flow Graph — Default)**
CFG mode allows event reuse within the workflow. Events can appear multiple times in different contexts. Each traversal is a discrete execution with its own checkpoint, lifecycle, and result.

```pointy
@mode: "CFG"
InitCounter -> ProcessItem (
    0 -> Finalize,                              # Exit condition
    1 -> TransformItem -> IncCounter -> ProcessItem  # Reuse ProcessItem
)
```

Important: Event reuse does NOT create infinite loops. Each execution is discrete:
```pointy
@mode: "CFG"
# Retry pattern: FetchData can be revisited
FetchData -> ValidateData (
    0 -> LogError -> FetchData,  # Retry
    1 -> ProcessData             # Continue
)
```

When to use CFG mode:
* Polling patterns with retries
* Batch processing with pagination
* Agent handoff loops (AnalystAgent → ReviewerAgent → AnalystAgent)
* State machines with revisitable states
* Workflows where events may need to execute more than once in different contexts

Choosing between DAG and CFG:
| Scenario | Recommended Mode | Reason |
| :--- | :--- | :--- |
| Data pipeline | DAG | Linear flow, no reuse needed |
| ETL process | DAG | Sequential extract, transform, load |
| Approval workflow | DAG | Linear approval chain |
| Polling with retries | CFG | Needs to reuse events until success |
| Batch processor with pagination | CFG | Loop through pages |
| Agent handoffs | CFG | Agents revisit each other during review cycles |
| State machines | CFG | Continuous state transitions |

### Recursive Depth Directive (@recursive-depth)
Controls the maximum nesting depth of the compiled graph. This directive is being deprecated as the runtime engine has been changed to an iterative, queue-based algorithm that does not require recursion.

```pointy
@recursive-depth: 3000
```

Default: Implementation-specific (typically 1000).

Note: This directive exists for backward compatibility with older Pointy-Lang files. New workflows do not need to set it. The runtime uses BFS traversal with a work queue, eliminating stack depth concerns.

### Production Workflow Example
```pointy
@mode: "DAG"

# Production pipeline with error handling
local::FetchOrders * 3
    -> pypi::ValidateOrders (
        0 -> local::LogValidationError -> github::NotifyTeam,
        1 -> pypi::EnrichOrderData || local::CalculateTaxes
             |-> github::GenerateInvoice (
                 0 -> local::RetryInvoiceGeneration * 2,
                 1 -> pypi::SendToCustomer -> local::UpdateDatabase
             )
    )
```

### Common Mistakes
❌ **Placing directives after events:**
```pointy
# WRONG
LoadData -> ProcessData
@mode: "DAG"  # ERROR: Directive must come first
```
✅ **Fix:** Place directives at the top of the file.

❌ **Using DAG mode with event reuse:**
```pointy
@mode: "DAG"
StartLoop -> ProcessItem (
    0 -> EndLoop,
    1 -> DoWork -> StartLoop  # ERROR: Event reuse in DAG mode
)
```
✅ **Fix:** Use CFG mode for workflows that need event reuse.

❌ **Specifying the same directive twice:**
```pointy
@mode: "DAG"
@recursive-depth: 2000
@mode: "CFG"  # WARNING: Duplicate directive — last value wins
```
✅ **Fix:** Specify each directive only once.

❌ **Invalid mode values:**
```pointy
@mode: "GRAPH"  # ERROR: Invalid mode — use "DAG", "CFG", "strict", or "flexible"
```
✅ **Fix:** Use only valid mode values.

## Variables and Data Types
Pointy-Lang supports variable declarations for configuring workflows. Variables are declared at the top of the file (after directives, before event expressions) and are read-only throughout the workflow.

### Scalar Types
Integers:
```pointy
@count = 42
@negative = -17
```

Floats:
```pointy
@pi = 3.14159
@rate = 2.5
```

Booleans:
```pointy
@enabled = true
@debug_mode = false
```

Strings:
```pointy
@service_name = "UserAuthentication"
@environment = "production"
```

### Collection Types
Lists:
```pointy
@numbers = [1, 2, 3, 4, 5]
@names = ["Alice", "Bob", "Charlie"]
@mixed = [1, "text", true, 3.14]
```

Maps (Dictionaries):
```pointy
@config = {
    "host": "localhost",
    "port": 8080,
    "ssl": true
}

@user = {
    "name": "John",
    "age": 30,
    "active": true
}
```

Nested Structures:
```pointy
@database_config = {
    "primary": {
        "host": "db1.example.com",
        "port": 5432
    },
    "replica": {
        "host": "db2.example.com",
        "port": 5432
    },
    "pool_size": 10
}
```

### Variable Declaration
Declare variables with `@`:
```pointy
@retries = 4
@timeout = 30.5
@debug = true
@service = "DataProcessor"
```

Reference variables with `$`:
```pointy
@max_retries = 3
@delay = 1.5

FetchData[retry_attempts=$max_retries, delay=$delay]
```

### Variable Assignment
Copy values between variables:
```pointy
@original = 10
@copy = $original
@backup = $copy
```

Evaluation order: Variables are evaluated in declaration order. Later variables can reference earlier ones:
```pointy
@a = 5
@c = $a  # OK: References earlier variable
```

Circular references are not allowed:
```pointy
# ❌ Circular reference
@x = $y
@y = $x
```

### Environment Variables
Access environment variables using the `$env` namespace:
```pointy
@api_key = $env.API_KEY
@max_retries = $env.MAX_RETRIES
@debug_mode = $env.DEBUG
@database_url = $env.DATABASE_URL
```

Environment variables are resolved at workflow execution time by the Volnux runtime.

```pointy
@timeout = $env.SERVICE_TIMEOUT
@retries = $env.MAX_RETRIES

CallExternalService[
    timeout=$timeout,
    retry_attempts=$retries
]
```

### Null Coalescing Operator (??)
Provide defaults for potentially undefined variables:
```pointy
# If TIMEOUT is undefined, use 30
@timeout = $env.TIMEOUT ?? 30

# Chain multiple fallbacks
@host = $env.PRIMARY_HOST ?? $env.SECONDARY_HOST ?? "localhost"

# With other variables
@retries = $env.MAX_RETRIES ?? $default_retries ?? 3
```

Practical example:
```pointy
@api_timeout = $env.API_TIMEOUT ?? 30.0
@max_retries = $env.MAX_RETRIES ?? 3
@enable_cache = $env.ENABLE_CACHE ?? true
@log_level = $env.LOG_LEVEL ?? "INFO"

CallExternalAPI[
    timeout=$api_timeout,
    retry_attempts=$max_retries,
    use_cache=$enable_cache,
    log_level=$log_level
]
```

### Ternary Expressions
Conditional assignment based on comparisons:

```pointy
# Basic ternary
@retries = $env.ENABLE_RETRIES == "true" ? 5 : 0

# With null check
@timeout = $env.TIMEOUT == NULL ? 30 : $env.TIMEOUT

# Comparing numbers
@batch_size = $env.LOAD_LEVEL == "high" ? 100 : 10
```

Environment-specific configuration:
```pointy
@environment = $env.DEPLOY_ENV ?? "development"
@workers = $environment == "production" ? 16 : 4
@cache_enabled = $environment == "production" ? true : false

ProcessData[
    worker_count=$workers,
    enable_cache=$cache_enabled
]
```

Comparison operators:

| Operator | Description |
| :--- | :--- |
| `==` | Equal to |
| `!=` | Not equal to |
| `>` | Greater than |
| `<` | Less than |
| `>=` | Greater than or equal |
| `<=` | Less than or equal |

Examples:
```pointy
@cpu_count = $env.CPU_COUNT ?? 4
@workers = $cpu_count > 8 ? 16 : 4
@use_cache = $env.CACHE_SIZE >= 1000 ? true : false
@priority = $env.QUEUE_SIZE < 100 ? "low" : "high"
```

### Expression Limitations
Pointy-Lang is designed for workflow orchestration, not computation. Complex logic belongs in events.

What you CANNOT do:
```pointy
# ❌ No arithmetic on variables
@total = $count + 10
@result = $a * $b

# ❌ No function calls
@uppercase = uppercase($name)
@length = len($list)

# ❌ No complex boolean logic
@result = $a > 5 && $b < 10
@flag = !$enabled

# ❌ No string concatenation
@full_name = $first + " " + $last
```

What you CAN do:
```pointy
# ✅ Simple comparisons in ternaries
@is_production = $env.ENV == "production" ? true : false

# ✅ Null coalescing with multiple fallbacks
@value = $env.VAR1 ?? $env.VAR2 ?? $default ?? 0

# ✅ Nested ternary (use sparingly)
@level = $env.ENV == "prod" ? "high" : ($env.ENV == "staging" ? "medium" : "low")
```

Rationale: Pointy-Lang focuses on workflow orchestration. For complex data transformations or calculations, implement them in your event code.

### Variable Scope
Variables have two scopes: global and local.

**Global Variables** — Declared outside event attributes, accessible everywhere:
```pointy
@global_retries = 3
@global_timeout = 30
@global_executor = "thread"

FetchData[retry_attempts=$global_retries, timeout=$global_timeout]
ProcessData[retry_attempts=$global_retries, executor=$global_executor]
SaveData[timeout=$global_timeout]
```

**Local Attributes** — Defined within `[]` brackets, scoped to that event only:
```pointy
@global_retries = 3

FetchData[
    retry_attempts=$global_retries,
    buffer_size=1024  # Local to FetchData
]

ProcessData[
    retry_attempts=$global_retries,
    buffer_size=2048,  # Different local value, no conflict
    chunk_size=512     # Local to ProcessData
]

# ❌ Cannot reference local attributes globally
SaveData[size=$buffer_size]  # Error: buffer_size is not a global variable
```

### Variable Mutability
All variables in Pointy-Lang are read-only (immutable):

```pointy
@counter = 0

# ❌ Events cannot modify variables
IncrementCounter  # Cannot change @counter from within event

# ❌ Cannot reassign variables
@counter = $counter + 1  # Not supported
```

Rationale: Immutability prevents race conditions in concurrent execution and makes workflows predictable and easier to debug.

### Practical Examples
Configuration with fallbacks:
```pointy
@api_timeout = $env.API_TIMEOUT ?? 30.0
@max_retries = $env.MAX_RETRIES ?? 3
@enable_cache = $env.ENABLE_CACHE ?? true

CallExternalAPI[
    timeout=$api_timeout,
    retry_attempts=$max_retries,
    use_cache=$enable_cache
]
```

Environment-specific behavior:
```pointy
@environment = $env.DEPLOY_ENV ?? "development"
@batch_size = $environment == "production" ? 1000 : 10
@log_level = $environment == "production" ? "WARNING" : "DEBUG"
@workers = $environment == "production" ? 16 : 4

ProcessData[
    batch_size=$batch_size,
    log_level=$log_level,
    worker_count=$workers
]
```

Safe null handling:
```pointy
# ❌ Avoid — will fail if undefined
@timeout = $env.TIMEOUT

# ✅ Safe with default
@timeout = $env.TIMEOUT ?? 30

# ✅ Explicit null check
@timeout = $env.TIMEOUT == NULL ? 30 : $env.TIMEOUT
```

Complex configuration:
```pointy
@env_name = $env.ENVIRONMENT ?? "dev"
@is_prod = $env_name == "production" ? true : false
@is_staging = $env_name == "staging" ? true : false
@db_pool_size = $is_prod ? 50 : ($is_staging ? 20 : 5)
@cache_ttl = $is_prod ? 3600 : 300
@rate_limit = $is_prod ? 1000 : 100

{
    ConnectDatabase[pool_size=$db_pool_size] ->
    SetupCache[ttl=$cache_ttl] ->
    ConfigureRateLimit[limit=$rate_limit]
}[executor="thread"]
```

Using variables in workflows:
```pointy
@batch_size = 50
@retry_count = 3
@executor_type = "thread"

{
    LoadData -> 
    ProcessData -> 
    SaveData
}[
    batch_size=$batch_size,
    retry_attempts=$retry_count,
    executor=$executor_type
]
```

### Variable Naming Rules
Valid names:
* `retries`
* `TIMEOUT_VALUE`
* `_global_config`
* `server1_url`
* `isActive`

Invalid names:
* `1variable` — starts with a number
* `my-variable` — contains hyphen
* `config.timeout` — contains dot

## Namespace System
Namespaces differentiate events from different sources. They tell the Pointy-Lang compiler where to find an event's implementation — locally, in a PyPI package, on GitHub, or in a custom registry.

### Namespace Syntax
```pointy
namespace::EventName
```

The namespace prefix is separated from the event name by `::`. If no namespace is specified, `local::` is implicit.

### Supported Namespaces
| Namespace | Source | Description |
| :--- | :--- | :--- |
| `local::` | Local project | Events defined in your project's `events.py` or registered sources |
| `pypi::` | Python Package Index | Events from PyPI packages declared in `ready()` |
| `github::` | GitHub repositories | Events from GitHub sources declared in `ready()` |
| `hub::` | EventHub registry | Events from EventHub packages declared in `ready()` |

### Using Namespaces
Local events (default):
```pointy
local::ValidateInput -> local::ProcessLocally

# 'local::' is implicit when no namespace is specified
ValidateInput -> ProcessLocally
```

PyPI packages:
```pointy
pypi::LoadData -> pypi::ProcessData
```

GitHub repositories:
```pointy
github::FetchConfig -> github::ApplyConfig
```

Mixed sources in a single workflow:
```pointy
pypi::FetchUserData || github::FetchPreferences || local::FetchHistory
```

With Meta Events:
```pointy
pypi::LoadUsers |-> MAP<local::ProcessUser>[concurrent=true] |-> github::SaveResults
```

With annotations:
```pointy
pypi::FetchData[retry_attempts=3, timeout=30.0] -> local::ValidateData
```

### Why Use Namespaces?
Clarity — Explicit sources are self-documenting:
```pointy
# ✅ Good — sources are explicit
pypi::StandardProcessor -> local::CustomValidator -> github::SharedUtility

# ❌ Risky — sources are ambiguous
StandardProcessor -> CustomValidator -> SharedUtility
```
An auditor reading the first line knows exactly where each event comes from. The second line requires checking `ready()` to understand the sources.

Reusability — Compose workflows from multiple sources:
* Pull standard events from PyPI packages maintained by the community
* Share team events via GitHub repositories
* Use approved corporate events from a private EventHub registry
* Override with local implementations when customization is needed

No naming collisions — Same event name, different sources:
```pointy
# Both have a 'ValidateData' event — namespaces disambiguate
pypi::ValidateData -> local::ValidateData
```
The PyPI package provides standard validation. The local project provides custom validation. Both are named `ValidateData`. The namespace distinguishes them.

### Namespace Resolution
Namespaces are resolved against the sources registered in your workflow's `ready()` method:
```python
def ready(self):
    # Registers the 'pypi::' namespace
    self.register_source(WorkflowSource(
        name="standard-events",
        source_type=RegistrySource.PYPI,
        location="volnux-standard-events",
        version="1.5.0",
    ))
    
    # Registers the 'github::' namespace
    self.register_source(WorkflowSource(
        name="team-utils",
        source_type=RegistrySource.GITHUB,
        location="my-team/volnux-events",
        version="2.1.0",
    ))
    
    # Registers the 'hub::' namespace
    self.register_source(WorkflowSource(
        name="corporate-events",
        source_type=RegistrySource.HUB,
        location="corp/approved-events",
        version="3.0.0",
    ))
```

The compiler resolves `pypi::ValidateData` by finding which registered source provides the `pypi::` namespace and looking up `ValidateData` in that package's manifest.

### Resolution Errors
If an event cannot be resolved, the compiler reports the error at parse time:
```text
Error: Event 'pypi::ValidateData' cannot be resolved.
  - No source registered for namespace 'pypi::'
  - Register a PyPI source in your workflow's ready() method.
  
Error: Event 'github::FetchConfig' cannot be resolved.
  - Source 'team-utils' (github) is registered but does not export 'FetchConfig'.
  - Available events: FetchSettings, ApplyConfig, NotifyTeam
```

### Production Example
```pointy
@retries = $env.MAX_RETRIES ?? 3
@timeout = $env.SERVICE_TIMEOUT ?? 30.0

# Standard validation from PyPI
pypi::ValidateEmail[retry_attempts=$retries] ->

# Custom business logic locally
local::ApplyBusinessRules ->

# Shared notification utility from GitHub
github::SendNotification[timeout=$timeout] ->

# Approved persistence layer from corporate EventHub
hub::SaveToDataWarehouse
```

Each event comes from a different source. The workflow composes them declaratively. The auditor sees exactly what runs and where it came from. The governance is in the syntax.

## Static Graph and Parse-Time Validation
Pointy-Lang compiles to a static graph before execution. The engine knows every event, every dependency, every branch before anything runs.

This enables:
* **Parse-time error detection**: Undefined events, invalid operators, disallowed nesting are caught at compile time, not runtime.
* **Cycle detection**: The compiler rejects circular dependencies.
* **Namespace resolution**: All event names are resolved against local events and registered sources.
* **Canvas UI**: The static graph can be rendered visually for review.
* **Compliance readability**: An auditor can see every possible execution path.

The tradeoff: you cannot dynamically generate new workflow branches at runtime based on intermediate data. You can branch (via conditionals), iterate (via Meta Events), and revisit (via CFG mode). But the structure — which events exist, how they connect — is fixed. This is intentional. Governance requires predictability.

## Why Pointy-Lang Has No Loop Construct
Pointy-Lang has no `while`, no `for`, no recursion. This is not an omission. It's a design decision that forces the correct separation of abstractions.

Loops in a workflow definition would mean:
* The graph is not statically analyzable (you can't know how many iterations will occur)
* Compliance officers cannot read the workflow (they must understand the loop logic)
* The ReAct reasoning loop for agents would leak into the orchestration layer

Instead, loops belong inside events:
* Agent reasoning loops belong in `AgentEventBase.process()` — it's an implementation detail of the agent, not a workflow structure.
* Iteration over data belongs in Meta Events — `MAP<Event>` applies an event to each item.
* Retry loops belong in the event's `RetryMixin` — exponential backoff, exception scoping.
* Agent handoff loops belong in CFG mode's event reuse — revisit a node in a different context.

The graph is the workflow skeleton. Loops are the muscle inside each bone. Separating them makes both governable.
