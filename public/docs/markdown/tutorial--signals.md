# Signals

## Soft Signaling Framework

The Signaling Framework is a core component of the Event-Pipeline library, enabling you to connect custom behaviors 
to specific points in the lifecycle of a pipeline and its events. The framework utilizes the `SoftSignal` class, 
which allows for easy connection of listeners to signals. This enables the implementation of custom logic that 
can be executed at critical moments in your pipeline's operation.

### Default Signals

The following default signals are provided for various stages of the pipeline:

#### Initialization Signals

- **`pipeline_pre_init`**:
  - **Description**: This signal is emitted before the pipeline is initialized. It allows you to execute logic right at the start of the initialization process.
  - **Arguments**:
    - `cls`: The class of the pipeline being initialized.
    - `args`: Positional arguments passed during initialization.
    - `kwargs`: Keyword arguments passed during initialization.

- **`pipeline_post_init`**:
  - **Description**: This signal is emitted after the pipeline has been successfully initialized. You can use this to perform actions that depend on the pipeline being ready.
  - **Arguments**:
    - `pipeline`: The instance of the initialized pipeline.

#### Shutdown Signals

- **`pipeline_shutdown`**:
  - **Description**: Emitted when the pipeline is shutting down. This is an opportunity to clean up resources or save state.
  - **Arguments**: None

- **`pipeline_stop`**:
  - **Description**: Triggered when the pipeline is stopped. This can be useful for halting ongoing operations or notifications.
  - **Arguments**: None

#### Execution Signals

- **`pipeline_execution_start`**:
  - **Description**: This signal is emitted when the execution of the pipeline begins. It's useful for logging or starting monitoring.
  - **Arguments**:
    - `pipeline`: The instance of the pipeline that is starting execution.

- **`pipeline_execution_end`**:
  - **Description**: Triggered when the execution of the pipeline has completed. You can use this for final logging or cleanup.
  - **Arguments**:
    - `execution_context`: Context information about the execution, such as status and results.

#### Event Execution Signals

- **`event_execution_init`**:
  - **Description**: Emitted when an event execution is initialized. This can be used to set up necessary preconditions for the event processing.
  - **Arguments**:
    - `event`: The event being processed.
    - `execution_context`: The context in which the event is executed.
    - `executor`: The executor responsible for handling the event.
    - `call_kwargs`: Additional keyword arguments for the event execution.

- **`event_execution_start`**:
  - **Description**: This signal is emitted when the execution of a specific event starts. It’s useful for tracking the start of event processing.
  - **Arguments**:
    - `event`: The event that is starting.
    - `execution_context`: The context in which the event is being executed.

- **`event_execution_end`**:
  - **Description**: Triggered when the execution of an event ends. This is useful for post-processing or finalizing the event's outcomes.
  - **Arguments**:
    - `event`: The event that has finished execution.
    - `execution_context`: The context in which the event was executed.
    - `future`: A future object representing the result of the event execution.

- **`event_execution_retry`**:
  - **Description**: Emitted when an event execution is retried. This is useful for tracking retries and implementing custom backoff strategies.
  - **Arguments**:
    - `event`: The event being retried.
    - `execution_context`: The context for the retry execution.
    - `task_id`: The identifier for the specific task being retried.
    - `backoff`: The backoff strategy or duration.
    - `retry_count`: The current count of retries that have been attempted.
    - `max_attempts`: The maximum number of allowed attempts.

- **`event_execution_retry_done`**:
  - **Description**: Triggered when a retry of an event execution is completed. This can be useful for logging or updating the state after retries.
  - **Arguments**:
    - `event`: The event that has completed its retry process.
    - `execution_context`: The context in which the event was executed.
    - `task_id`: The identifier for the task that was retried.
    - `max_attempts`: The maximum number of attempts that were allowed for the task.

### Connecting Listeners to Signals

To leverage the signaling framework, you can connect listeners to these signals. Listeners are functions that will be 
called when a specific signal is emitted. Here's how to connect a listener:

```python
from volnux.signal.signals import pipeline_execution_start
from volnux import Pipeline

def my_listener(pipeline):
    print(f"Execution starting for pipeline: {pipeline}")

# Connect the listener to the signal
pipeline_execution_start.connect(my_listener, sender=Pipeline)
``` 
***Or***
```python
from volnux.decorators import listener
from volnux.signal.signals import pipeline_pre_init
from volnux import Pipeline

@listener(pipeline_pre_init, sender=Pipeline)
def my_lister(sender, signal, *args, **kwargs):
    print("Executing pipeline")

```
