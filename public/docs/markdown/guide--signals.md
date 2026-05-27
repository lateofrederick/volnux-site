# Signals

The **Signaling Framework** is a core component of Volnux, enabling you to connect custom behaviors to specific points in the lifecycle of a pipeline and its events.

Volnux utilizes the `SoftSignal` class, a lightweight publisher/subscriber system. It allows you to implement cross-cutting concerns—like logging, auditing, or updating external systems—without hard-coding that logic into your business events.

## Connecting and Disconnecting Listeners

To react to a signal, you write a listener function and `connect` it to the signal. A listener is simply a callable that accepts keyword arguments.

```python
from volnux.signal.signals import pipeline_execution_start
from volnux.pipeline import Pipeline

# 1. Define the listener
def on_pipeline_started(pipeline: Pipeline, **kwargs):
    print(f"Pipeline {pipeline.id} has started executing!")

# 2. Connect the listener
# If sender=None, it listens to ALL pipelines. 
# You can also pass a specific Pipeline class to only listen to that class.
pipeline_execution_start.connect(sender=None, listener=on_pipeline_started)
```

To stop listening to a signal, use `disconnect`:
```python
pipeline_execution_start.disconnect(sender=None, listener=on_pipeline_started)
```

## Available Lifecycle Signals

Volnux provides an extensive list of built-in signals that are emitted at every crucial stage of execution. You can import any of these directly from `volnux.signal.signals`.

### Pipeline Lifecycle Signals

- **`pipeline_pre_init`**: Emitted before the pipeline class finishes initialization. Provides `args` and `kwargs`.
- **`pipeline_post_init`**: Emitted immediately after pipeline initialization. Provides `pipeline`.
- **`pipeline_execution_start`**: Emitted when `pipeline.start()` is called. Provides `pipeline`.
- **`pipeline_execution_end`**: Emitted when the entire pipeline finishes executing successfully. Provides `execution_context`.
- **`pipeline_shutdown`**: Emitted if the pipeline is aborted.
- **`pipeline_stop`**: Emitted if the pipeline is cancelled.

### Event & Task Lifecycle Signals

These signals fire as individual events (tasks) move through the execution graph:

- **`event_init`**: Emitted when an event instance is created.
- **`event_execution_start`**: Emitted right before an event's `process` method is called.
- **`event_execution_end`**: Emitted right after an event finishes processing.
- **`event_execution_failed`**: Emitted if the event raises an unhandled exception or exhausts retries.
- **`event_execution_retry`**: Emitted when an event fails but is scheduled for a retry based on its `RetryPolicy`. Provides `task_id`, `backoff`, `retry_count`, and `max_attempts`.
- **`event_execution_retry_done`**: Emitted when an event exhausts all its available retries.

### Batch Processing Signals

When using `BatchPipeline`, you get dedicated signals to track the progress of the parallel batches:

- **`batch_pipeline_started`**: Emitted when the batch orchestrator begins. Provides `total_pipelines`.
- **`pipeline_metrics_updated`**: Emitted continuously as batches complete. Provides `metrics`, `active_count`, and `completion_rate`.
- **`batch_pipeline_finished`**: Emitted when all batches are done. Provides final `metrics`, `success_rate`, and `total_duration`.

## Advanced Usage: Emitting Custom Signals

You can easily create and emit your own signals to decouple logic within your application.

```python
from volnux.signal.signals import SoftSignal

# Define a custom signal
user_registered = SoftSignal("user_registered", provide_args=["user_id", "email"])

def send_welcome_email(user_id, email, **kwargs):
    print(f"Sending email to {email}")

# Connect listener
user_registered.connect(sender=None, listener=send_welcome_email)

# Emit the signal from your code
# You can emit synchronously (emit) or asynchronously (emit_async)
user_registered.emit(sender=MyClass, user_id="123", email="user@example.com")
```

