# Defining Events

## Define the Event Class

To define an event, you need to inherit from the EventBase class and override the process method. 
This process method defines the logic for how the event is executed.

```python
from volnux import EventBase

class MyEvent(EventBase):
    def process(self, *args, **kwargs):
        # Event processing logic here
        return True, "Event processed successfully"
```

## Specify the Executor for the Event

Every event must specify an executor that defines how the event will be executed. Executors are 
responsible for managing the concurrency or parallelism when the event is being processed.

Executors implement the Executor interface from the concurrent.futures._base module in the 
Python standard library. If no executor is specified, the `DefaultExecutor` will be used.

```python
from concurrent.futures import ThreadPoolExecutor

class MyEvent(EventBase):
    executor = ThreadPoolExecutor  # Specify executor for the event
    
    def process(self, *args, **kwargs):
        # Event processing logic here
        return True, "Event processed successfully"

```

## Executor Configuration

The `ExecutorInitializerConfig` class is used to configure the initialization of an executor 
(such as ProcessPoolExecutor or ThreadPoolExecutor) that manages event processing. This class allows you 
to control several aspects of the executor’s behavior, including the number of workers, task limits, 
and thread naming conventions.

### Configuration Fields
The ExecutorInitializerConfig class contains the following configuration fields. If you are using 
`ProcessPoolExecutor` or `ThreadPoolExecutor`, you can configure additional properties to control the 
behavior of the executor:

1. `max_workers`
    - ***Type***: `int` or `EMPTY`
    - ***Description***: Specifies the maximum number of workers (processes or threads) that can be used to execute 
    the event. If this is not provided, the number of workers defaults to the number of processors available on the machine.
    - ***Usage***: Set this field to an integer value if you wish to limit the number of workers. If left as EMPTY, 
    the system will use the default number of workers based on the machine’s processor count.

2. `max_tasks_per_child`
   - ***Type***: `int` or `EMPTY`
   - ***Description***: Defines the maximum number of tasks a worker can complete before being replaced by a new worker. 
   This can be useful for limiting the lifetime of a worker, especially for long-running tasks, to avoid memory buildup 
   or potential issues with task state.
   - ***Usage***: Set this field to an integer to limit the number of tasks per worker. If set to EMPTY, workers will 
   live for as long as the executor runs.

3. `thread_name_prefix`
    - ***Type***: `str` or `EMPTY`
    - ***Description***: A string to use as a prefix when naming threads. This helps identify threads related to event 
    processing during execution.
    - ***Usage***: Set this field to a string to provide a custom thread naming convention. If left as EMPTY, 
    threads will not have a prefix.

Here’s an example of how to use the ExecutorInitializerConfig class to configure an executor for event processing:

```python
from volnux import ExecutorInitializerConfig

# Configuring an executor with a specific number of workers, max tasks per worker, and thread name prefix
config = ExecutorInitializerConfig(
    max_workers=4,
    max_tasks_per_child=50,
    thread_name_prefix="event_executor_"
)

class MyEvent(EventBase):
    executor = ThreadPoolExecutor
    
    # Configure the executor
    executor_config = config
    
    def process(self, *args, **kwargs):
        # Event processing logic here
        return True, "Event processed successfully"

# Or you can config it, using dictionary as below
class MyEvent(EventBase):
    executor = ThreadPoolExecutor
    
    # Configure the executor
    executor_config = {
        "max_workers": 4,
        "max_tasks_per_child": 50,
        "thread_name_prefix": "event_executor_"
    }
    
    def process(self, *args, **kwargs):
        # Event processing logic here
        return True, "Event processed successfully"
```

In this example:

The executor will allow 4 workers (processes or threads, depending on the executor type).
Each worker will process a maximum of 50 tasks before being replaced.
The thread names will begin with the prefix event_executor_, making it easier to identify threads related 
to event processing.

## Default Behavior
If no fields are specified or left as EMPTY, the executor will use the following default behavior:

max_workers: The number of workers will default to the number of processors on the machine.
max_tasks_per_child: Workers will continue processing tasks indefinitely, with no limit.
thread_name_prefix: Threads will not have a custom prefix.
For example, the following code creates an executor with default behavior:

```python
config = ExecutorInitializerConfig()  # Default configuration
```


## Function-Based Events
In addition to defining events using classes, you can also define events as functions. 
This is achieved by using the event decorator from the decorators module.

The decorator allows you to configure the executor, just like in class-based events, 
providing flexibility for execution.

```python
from volnux.decorators import event

# Define a function-based event using the @event decorator
@event()
def my_event(*args, **kwargs):
    # Event processing logic here
    return True, "Event processed successfully"
```

The event decorator allows you to define an event as a simple function. You can also configure the 
executor for the event's execution using parameters like max_workers, max_tasks_per_child, and thread_name_prefix.

```python
from volnux.decorators import event
from concurrent.futures import ThreadPoolExecutor

# Define a function-based event using the @event decorator
@event(
    executor=ThreadPoolExecutor,               # Define the executor to use for event execution
    max_workers=4,                             # Specify max workers for ThreadPoolExecutor
    max_tasks_per_child=10,                    # Limit tasks per worker
    thread_name_prefix="my_event_executor",    # Prefix for thread names
    stop_on_exception=True                     # Flag to stop execution if an exception occurs
)
def my_event(*args, **kwargs):
    # Event processing logic here
    return True, "Event processed successfully"
```
The `@event` decorator registers the function as an event in the pipeline and configures the executor for the event execution.

## Event Result Evaluation
The `EventExecutionEvaluationState` class defines the criteria for evaluating the success or failure of an event 
based on the outcomes of its tasks. The states available are:

- `SUCCESS_ON_ALL_EVENTS_SUCCESS`: The event is considered successful only if all the tasks within the event succeeded. 
If any task fails, the evaluation is marked as a failure. This is the `default` state.

- `FAILURE_FOR_PARTIAL_ERROR`: The event is considered a failure if any of the tasks fail. Even if some tasks succeed, 
a failure in any one task results in the event being considered a failure.

- `SUCCESS_FOR_PARTIAL_SUCCESS`: This state treats the event as successful if at least one task succeeds. Even if 
other tasks fail, the event will be considered successful as long as one succeeds.

- `FAILURE_FOR_ALL_EVENTS_FAILURE`: The event is considered a failure only if all tasks fail. If any task succeeds, 
the event is marked as successful.

Each state can be used to configure how an event's success or failure is determined, allowing for flexibility 
in managing workflows.

### Example Usage
Here's how you can set the execution evaluation state in your event class:

```python
from volnux import EventBase, EventExecutionEvaluationState

class MyEvent(EventBase):
    execution_evaluation_state = EventExecutionEvaluationState.SUCCESS_ON_ALL_EVENTS_SUCCESS
    
    def process(self, *args, **kwargs):
        return True, "obrafour"

```

## Specifying a Retry Policy for Event
In some scenarios, you may want to define a retry policy for handling events that may fail intermittently. 
The retry policy allows you to configure things like the maximum number of retry attempts, the backoff strategy, 
and which exceptions should trigger a retry.

The retry policy can be specified by importing the RetryPolicy class and configuring the respective fields. 
You can then assign this policy to your event class, ensuring that failed events will be retried based on 
the configured settings.

### RetryPolicy Class
The RetryPolicy class allows you to define a policy with the following parameters:

```python
@dataclass
class RetryPolicy(object):
    max_attempts: int   # Maximum retry attempts
    backoff_factor: float  # Backoff time between retries
    max_backoff: float # Maximum allowed backoff time
    retry_on_exceptions: typing.List[typing.Type[Exception]]  # List of exceptions that will trigger a retry
```

### Configuring the RetryPolicy
To configure a retry policy, you can create an instance of RetryPolicy and set its fields based on your desired 
settings. The retry policy can also be defined as a dictionary.

For example:

```python
from volnux.base import RetryPolicy

# Define a custom retry policy
retry_policy = RetryPolicy(
    max_attempts=5,  # Maximum number of retries
    backoff_factor=0.1,  # 10% backoff factor
    max_backoff=5.0,  # Max backoff of 5 seconds
    retry_on_exceptions=[ConnectionError, TimeoutError]  # Retry on specific exceptions
)

# Or define the retry policy as a dictionary
retry_policy = {
    "max_attempts": 5,
    "backoff_factor": 0.1,
    "max_backoff": 5.0,
    "retry_on_exceptions": [ConnectionError, TimeoutError]
}
```
In this example:
- `max_attempts` specifies the maximum number of times the event will be retried before it gives up.
- `backoff_factor` defines how long the system will wait between retry attempts, increasing with each retry.
- `max_backoff specifies` the maximum time to wait between retries, ensuring it doesn't grow indefinitely.
- `retry_on_exceptions` is a list of exception types that should trigger a retry. If an event fails due to 
one of these exceptions, it will be retried.

### Assigning the Retry Policy to an Event

Once you have defined the RetryPolicy, you can assign it to your event class for processing. 
The policy can be passed as a dictionary containing the retry configuration.

Here’s how you can assign the retry policy to your event class:

```python
import typing
from volnux import EventBase


class MyEvent(EventBase):
    
    # assign instance of your RetryPolicy or RetryPolicy dictionary
    retry_policy = retry_policy 

    def process(self, *args, **kwargs) -> typing.Tuple[bool, typing.Any]:
        pass

```

In this example, the `retry_policy` class variable is assign the retry configuration.

# How the Retry Policy Works
When an event is processed, if it fails due to an exception in the retry_on_exceptions list, the retry logic kicks in:

- The system will retry the event based on the `max_attempts`.
- After each retry attempt, the system waits for a time interval determined by the `backoff_factor` 
and will not exceed the `max_backoff`.
- If the maximum retry attempts are exceeded, the event will be marked as failed.

- This retry mechanism ensures that intermittent failures do not cause a complete halt in processing and 
allows for better fault tolerance in your system.
