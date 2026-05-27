# Pipeline

In Volnux, a **Pipeline** is the top-level orchestration engine that defines a repeatable workflow. It manages data inputs, invokes the various **Events** (steps of work), and routes them together using the **Pointy-Lang** DSL.

Pipelines decouple the *execution logic* (which lives in Events) from the *orchestration logic* (which lives in the Pipeline). This means you don't write manual `try/catch` or `asyncio.gather` blocks; Volnux manages concurrency, retries, and data routing automatically based on your pipeline graph.

## Defining a Pipeline

To define a pipeline, inherit from the `Pipeline` class and define your data fields.

```python
from volnux import Pipeline
from volnux.fields import InputDataField

class MyPipeline(Pipeline):
    # Input fields that represent data flowing into the pipeline
    user_id = InputDataField(data_type=str, required=True)
```

Events can access these input field values by including the field name (e.g., `user_id`) in their `process()` method signature.

### Linking the Pointy-Lang File

Volnux uses **Pointy-Lang** (`.pty`) files to determine the execution order of your events. 

By default, if you have a class `MyPipeline`, Volnux will automatically look for a `MyPipeline.pty` file in the same directory. To specify a custom file or a raw string, use the `Meta` subclass:

```python
class MyPipeline(Pipeline):
    class Meta:
        file = "/path/to/my_custom_flow.pty"
        # Or you can pass the string directly:
        # pointy = "Fetch -> Process -> Save"
```

## Pointy-Lang DSL

Pointy-Lang is Volnux's domain-specific language for modeling workflows. It provides a visual, expressive syntax for sequential, parallel, and conditional execution.

### Operators

- **Sequential (`->`)**: Execute one event, then the next.
  ```pty
  Fetch -> Process
  ```
- **Parallel (`||`)**: Execute events concurrently.
  ```pty
  ProcessA || ProcessB
  ```
- **Piping (`|->`)**: Pass the result of the previous event(s) as input to the next event.
  ```pty
  (FetchA || FetchB) |-> AggregateResults
  ```
- **Retries (`*`)**: Specify how many times to retry an event if it fails (can be postfix or prefix).
  ```pty
  FetchAPI * 3  # Retry up to 3 times
  ```

### Conditional Branching and Descriptors

You can route the execution path based on the success, failure, or custom result of an event. Volnux uses numeric **Descriptors** for branching:
- `0`: Failure
- `1`: Success
- `3-9`: User-defined custom conditions (returned by the event).

```pty
# If Process fails (0), run Fallback. If it succeeds (1), run Save.
Process (0 -> Fallback, 1 -> Save)

# You can chain them:
Fetch -> Process (
    0 -> Fallback,
    1 -> Save
) -> Cleanup
```

## Executing the Pipeline

Once your pipeline is defined, instantiate it with your inputs and call `start()`.

```python
pipeline = MyPipeline(user_id="user_123")
execution_context = pipeline.start()
```

### Visualizing the Graph

Volnux can generate graphs of your Pointy-Lang workflows.

```python
# Print an ASCII tree in the console
pipeline.draw_ascii_graph()

# Generate a PNG image (requires Graphviz)
pipeline.draw_graphviz_image(directory="./graphs")
```

## Batch Processing

For processing millions of records in parallel, Volnux provides `BatchPipeline`. This automatically creates parallel instances of a standard pipeline to handle chunks of your data.

1. **Define the Base Pipeline** (with `batch_size` on an input field):
```python
class ItemPipeline(Pipeline):
    items = InputDataField(data_type=list, batch_size=100)
    
    class Meta:
        pointy = "ProcessItem -> SaveItem"
```

2. **Define the Batch Pipeline**:
```python
from volnux.pipeline import BatchPipeline

class MyBatch(BatchPipeline):
    pipeline_template = ItemPipeline
```

3. **Execute**:
```python
batch = MyBatch(items=[... large dataset ...])
batch.execute()
```

The batch processor emits real-time metrics during execution via the `PipelineExecutionMetrics` class, tracking `success_rate`, `average_duration`, `active` workers, and `errors`. You can hook into this using Volnux's signal framework (e.g., listening to `pipeline_metrics_updated` or `batch_pipeline_finished`).

