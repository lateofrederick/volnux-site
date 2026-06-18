Pointy-Lang is a powerful, expression-rich Domain-Specific Language (DSL) built natively into the Volnux framework. It goes far beyond simple workflow definitions by offering variables, expressions, meta-tasks (Map-Reduce), namespacing, and strict Directed Acyclic Graph (DAG) validation.

By writing `.pty` files, you separate the orchestration logic from the underlying Python execution, yielding a highly readable, visual representation of your data pipelines and event sequences.


## Directives and Execution Modes

Pointy-Lang supports compiler directives to enforce architectural constraints. The most critical directive is `@mode`.

```pointy
@mode: "dag"
```
> [!IMPORTANT]
> By default, Volnux allows Control Flow Graphs (`cfg`) where loops and cycles are permitted. If you set `@mode: "dag"`, the parser activates a strict **Cycle Detection Visitor**. If any cycles exist in your event graph, it will throw a `DAGValidationError` at compilation.



## Variables and Expressions

Pointy-Lang is not just a markup language; it supports complex variable assignments, data structures, and evaluation logic.

### Variable Declarations
You can declare variables using the `@` symbol:
```pointy
@batch_size = 100
@threshold = 0.95
@config = { "api_url": "https://api.example.com", "retries": 3 }
@flags = [true, false, true]
```

### Accessing Variables
Use the `$` prefix to access variables. You can also access system environment variables seamlessly via `$env`:
```pointy
$batch_size
$config.api_url
$flags[0]
$env.DATABASE_URI
```

### Rich Expressions
You can build complex logic right into the `.pty` file:
- **Ternary**: `$env.ENV == "prod" ? "production" : "staging"`
- **Null Coalescing**: `$env.OPTIONAL_KEY ?? "default_value"`
- **Arithmetic & Logic**: `(10 * $batch_size) + 5`, `$threshold > 0.5 && !false`



## Tasks, Namespaces, and Attributes

Events in Volnux are referenced by their class names or registered aliases.

### Namespaces
If you are composing workflows from multiple libraries or packages, use the `::` operator to specify namespaces:
```pointy
analytics::ProcessData -> billing::GenerateInvoice
```

### Task Attributes
You can inject dynamic configuration directly into specific events using brackets `[]`:
```pointy
ProcessData[timeout=30, batch_size=$batch_size]
```
These attributes are parsed as `AttributeNode`s and passed into the event's initialization, allowing you to reuse the same Python event with different inline parameters.



## Meta-Tasks (Data-Parallelism)

Pointy-Lang includes built-in syntax for distributed computing paradigms like Map-Reduce and Fan-out. Meta-tasks are wrapped in angle brackets `< >`.

```pointy
LoadData -> <MAP ProcessItem>[workers=4] -> <REDUCE AggregateResults>
```

Supported Modes:
- `<MAP Task>`: Maps over an iterable output.
- `<FILTER Task>`: Filters outputs based on the task result.
- `<REDUCE Task>`: Reduces a collection.
- `<FOREACH Task>`: Executes the task for every item (for side-effects).
- `<FLATMAP Task>`: Maps and flattens nested results.
- `<FANOUT Task>`: Broadcasts data across multiple branches or parallel tasks.



## Core Operators

Pointy-Lang relies on symbolic operators to define execution sequence and data flow.

### 1. Sequential (`->`)
Executes events sequentially.
```pointy
LoadData -> ProcessData -> SaveData
```

### 2. Parallel (`||`)
Runs events concurrently.
```pointy
ExtractUsers || ExtractOrders
```

### 3. Result Piping (`|->`)
Explicitly pipes the return value of one event as the input parameter for the next.
```pointy
FetchAPI |-> TransformData
```

### 4. Retry Operator (`*`)
Defines inline retry attempts. A task cannot be retried less than 2 times.
```pointy
UnstableNetworkCall * 3
```



## Conditional Branching

Events return tuples containing a success flag and data. These translate to numerical **descriptors** in Pointy-Lang to dictate the next path:
- `0`: Failure
- `1`: Success
- `2-9`: Custom conditions handled manually in the event logic via `self.goto()`.

```pointy
ProcessPayment (
    0 -> RefundCustomer,
    1 -> FulfillOrder,
    3 -> RequestManualReview  # Custom descriptor emitted from Python
)
```

You can also use pipe operators within branches to pass specific errors/results downstream:
```pointy
ValidateData (
    0 |-> LogValidationError,
    1 |-> ProcessData
)
```



## Pipeline Grouping

For large pipelines, you can group complex execution blocks using curly braces `{ }`. Groups act as cohesive units that can be assigned attributes or connected to other nodes.

```pointy
{
    FetchData -> <MAP CleanData>
}[timeout=300] -> StoreData
```

## Graph Generation and Visualization

Because Pointy-Lang rigidly defines the execution flow, the Volnux engine can automatically compile it into a **Directed Acyclic Graph (DAG)** and generate visual representations. This is incredibly helpful for documenting workflows or debugging complex pipelines.

Once a `.pty` file is loaded into a Python `Pipeline`, you have access to out-of-the-box graph visualization tools:

### 1. ASCII Graphs
You can generate a tree-based ASCII graph right in your terminal output:
```python
pipeline.draw_ascii_graph()
```
This prints the full topological tree, labeling parallel groups, conditions `(?)`, and sinks `(Sink)`.

### 2. Graphviz (DOT) Images
For a high-quality visualization, Volnux can translate the Pointy-Lang AST into a **Graphviz DOT** format and render a PNG image of your entire workflow:
```python
pipeline.draw_graphviz_image(directory="pipeline-graphs")
```

## Import Strings and Execution Configuration

One of the most powerful underlying features of Pointy-Lang's parser is its ability to automatically detect **Python Import Strings** in your variables. If you assign a string that matches a valid Python module/class path, the AST parses it as an `IMPORT_STRING` type.

This allows you to dynamically configure Python objects (like custom Executors) purely from your `.pty` file!

```pointy
@executor = "event_pipeline.executors.ThreadPoolExecutor"
@config = { "max_workers": 10 }

# The executor path is safely imported and applied
FetchData[executor=$executor, config=$config]
```

Volnux inherently recognizes executor signatures like `THREADPOOL_EXECUTOR`, `PROCESSPOOL_EXECUTOR`, `GRPC_EXECUTOR`, and `TCP_EXECUTOR` directly from the Lexer, allowing you to seamlessly integrate remote and multi-threaded processing.



## Putting It All Together: A Complex Pipeline

Here is a comprehensive example demonstrating DAG enforcement, variables, meta-tasks, attributes, and branching:

```pointy
@mode: "dag"
@max_retries = 3
@api_config = { "host": $env.API_HOST, "timeout": 60 }

FetchBatch[config=$api_config] * $max_retries (
    0 |-> LogFetchError,
    1 |-> {
        <MAP EnrichItem>[workers=10] || FetchReferenceData
    } |-> <REDUCE CombineData> -> ValidateResults (
        0 -> AlertEngineers,
        1 -> data_warehouse::SyncToRedshift
    )
)
```

### What happens here?
1. **Validation**: The compiler validates the file is a strict DAG.
2. **Initialization**: Variables are evaluated (including reading from system environments).
3. **Fetching**: `FetchBatch` runs with injected `$api_config`. If it fails, it retries up to 3 times.
4. **Branching**:
   - On Failure (`0`), the error is piped (`|->`) into `LogFetchError`.
   - On Success (`1`), the result enters a grouped pipeline block.
5. **Parallelism & Meta-Tasks**: Inside the block, items are mapped across `EnrichItem` with 10 workers concurrently alongside a `FetchReferenceData` task.
6. **Data Merging**: The outputs of the grouped block are piped into `<REDUCE CombineData>`.
7. **Namespacing & Finalization**: Output is validated, alerting engineers on failure, or saving to Redshift via the `data_warehouse` namespace on success.
