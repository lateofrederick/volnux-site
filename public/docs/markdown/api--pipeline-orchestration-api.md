# Pipeline & Orchestration API

This section details the core classes used for defining and orchestrating workflows in Volnux.

---

## `Pipeline`

Base class for defining pipelines that process events in sequence. It manages the execution flow, state, and evaluation of events.

**Location**: `volnux.pipeline.Pipeline`

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `start(force_rerun: bool = False)` | `Optional[ExecutionContext]` | Initiates the execution of the pipeline. If `force_rerun` is False, raises `EventDone` if already executed. |
| `shutdown()` | `None` | Aborts the pipeline and emits the `pipeline_shutdown` signal. |
| `stop()` | `None` | Cancels the pipeline gracefully and emits the `pipeline_stop` signal. |
| `get_pipeline_tree()` | `Tree` | Returns a `treelib.Tree` representation of the pipeline structure via BFS traversal. |
| `draw_ascii_graph()` | `None` | Prints a visual ASCII representation of the pipeline graph to the console. |
| `draw_graphviz_image(directory: str)` | `None` | Generates a PNG graph visualization (Requires `graphviz`). Default directory is `pipeline-graphs`. |
| `get_task_by_id(pk: str)` | `PipelineTask` | Retrieves a specific task node from the graph. Raises `EventDoesNotExist` if not found. |

---

## `BatchPipeline`

An orchestrator class that executes multiple instances of a standard `Pipeline` template in parallel batches.

**Location**: `volnux.pipeline.BatchPipeline`

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `pipeline_template` | `Type[Pipeline]` | **Required**. The base pipeline class to use as the template for batching. |
| `listen_to_signals` | `List[str]` | List of signal names to automatically monitor and forward during execution. |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `execute()` | `None` | Begins parallel execution of the batches. Emits `batch_pipeline_started` and `batch_pipeline_finished`. |
| `get_pipeline_template()` | `Type[Pipeline]` | Returns the pipeline class used as the template. |

---

## `PipelineTask`

Represents a single node (task) in the execution graph, wrapping your `EventBase` logic.

**Location**: `volnux.parser.protocols.TaskType`

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `event` | `Type[EventBase]` | The event class this task will execute. |
| `is_conditional` | `bool` | Returns `True` if this task branches into multiple potential child paths based on its descriptor. |
| `is_parallel_execution_node` | `bool` | Returns `True` if this node is executed concurrently with others. |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `get_children()` | `List[PipelineTask]` | Gets all immediate child task nodes. |
| `get_root()` | `PipelineTask` | Gets the root task of the entire execution tree. |
| `get_descriptor(descriptor: int)` | `PipelineTask` | Gets the child task associated with the specific numeric result descriptor (0, 1, 3-9). |

---

## `EventExecutionContext`

The execution context instance created and passed along during a pipeline's run. It acts as a linked list, allowing you to traverse the state of previous events.

**Location**: `volnux.execution.context.ExecutionContext`

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `task_profiles` | `List[PipelineTask]` | The tasks currently being executed in this context. |
| `pipeline` | `Pipeline` | The parent pipeline instance. |
| `execution_result` | `ResultSet` | The accumulated execution results. |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `get_latest_context()` | `ExecutionContext` | Traverses the linked list to return the most recent execution context. |
| `execution_failed()` | `bool` | Returns `True` if the event execution resulted in a failure. |
| `execution_success()` | `bool` | Returns `True` if the event execution resulted in a success. |
| `cancel()` | `None` | Cancels the ongoing task execution. |
| `dispatch()` | `Optional[SwitchTask]` | Internal method to dispatch execution to the coordinator. |

