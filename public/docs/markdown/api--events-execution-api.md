# Events & Execution API

This section details the core classes used for defining the individual steps (Events) in your pipeline, along with their execution contexts and retry policies.

---

## `EventBase`

Abstract base class for all events in the pipeline system.

**Location**: `volnux.event.base.EventBase`

### Class Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `executor` | `Type[Executor]` | The executor class used to handle execution (e.g. `ThreadPoolExecutor`, `ProcessPoolExecutor`). Defaults to `DefaultExecutor`. |
| `executor_config` | `ExecutorInitializerConfig` | Configuration settings for the executor. Defaults to `None`. |
| `execution_evaluation_state` | `EventExecutionEvaluationState` | Defines how the event's success/failure is determined when processing parallel inputs. Defaults to `SUCCESS_ON_ALL_EVENTS_SUCCESS`. |
| `retry_policy` | `RetryPolicy` | Defines the backoff and retry behavior for the event. Defaults to `None`. |

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `process(*args, **kwargs)` | `Tuple[bool, Any]` | **Abstract**. Must be implemented. Contains the core business logic. Must return `(status, result)`. |
| `on_success(execution_result)`| `EventResult` | Hook called after a successful event execution. |
| `on_failure(execution_result)`| `EventResult` | Hook called after a failed event execution. |

---

## `RetryPolicy`

Configuration class defining how an event should retry on failure.

**Location**: `volnux.base.RetryPolicy`

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `max_attempts` | `int` | Maximum number of retry attempts. Defaults to `MAX_RETRIES`. |
| `backoff_factor` | `float` | Multiplier used to calculate exponential delay between retries. Defaults to `MAX_BACKOFF_FACTOR`. |
| `max_backoff` | `float` | Hard cap on the maximum delay (in seconds) between retries. Defaults to `MAX_BACKOFF`. |
| `retry_on_exceptions` | `List[Type[Exception]]` | List of explicit exception types that should trigger a retry. If an exception not in this list occurs, the event fails immediately. |

---

## `ExecutorInitializerConfig`

Configuration settings applied when initializing an event's worker pool.

**Location**: `volnux.execution.executors.ExecutorInitializerConfig`

### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `max_workers` | `int` | Maximum number of workers (threads or processes) for parallel execution. |
| `max_tasks_per_child` | `int` | Maximum number of tasks a worker process can handle before being recycled (prevents memory leaks). |
| `thread_name_prefix` | `str` | Custom prefix for naming executor threads, useful for debugging. |
| `timeout` | `int` | Execution timeout in seconds. Defaults to `30`. |
| `host` | `str` | Host address for remote executors. |
| `port` | `int` | Port number for remote executors. |

---

## `EventExecutionEvaluationState` (Enum)

Enum defining strategies for evaluating an event's overall success or failure when it processes multiple items (e.g. parallel arrays).

**Location**: `volnux.event.base.EventExecutionEvaluationState`

### Members

- `SUCCESS_ON_ALL_EVENTS_SUCCESS`: The event is successful only if **all** tasks succeed. Any failure marks the entire event as failed.
- `FAILURE_FOR_PARTIAL_ERROR`: The event fails if **any** task fails, regardless of other successes.
- `SUCCESS_FOR_PARTIAL_SUCCESS`: The event is successful if **at least one** task succeeds.
- `FAILURE_FOR_ALL_EVENTS_FAILURE`: The event fails only if **all** tasks fail. Any success marks the event as successful.

