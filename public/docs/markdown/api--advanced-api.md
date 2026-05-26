# Advanced API

This section details advanced internals, mixins, and parsing modules used under the hood by Volnux.

---

## `ScheduleMixin`

A mixin class providing scheduling capabilities to pipelines. Inherited by the base `Pipeline` class.

**Location**: `volnux.mixins.schedule.ScheduleMixin`

### Enums

#### `ScheduleTrigger`
Defines the three available scheduling paradigms:
- `DATE`: Triggers exactly once at a specific date.
- `INTERVAL`: Triggers continuously at specified intervals.
- `CRON`: Triggers based on cron-like date and time constraints.

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `get_pipeline_scheduler()` | `BackgroundScheduler` | Returns the global APScheduler `BackgroundScheduler` instance running the jobs. |
| `schedule_job(trigger, **kwargs)` | `Job` | Schedules the pipeline for execution. `kwargs` correspond to the specific APScheduler trigger arguments (e.g. `hours=2`, `run_date=dt`). |

---

## Pointy-Lang Parser

Volnux's domain-specific language compiler. These tools are used internally to convert `.pty` files into a runtime execution graph.

**Location**: `volnux.parser`

### `build_pipeline_flow_from_pointy_code(code: str)`

Parses raw Pointy-Lang code strings into a structured syntax tree.

- **Returns**: A root `TaskType` object representing the beginning of the execution graph.
- **Raises**: `PointyNotExecutable` if the syntax is fundamentally invalid.

### `PipeType` (Enum)

Defines the mathematical operations mapped to execution flow:
- `Sequential` (`->`): Tasks run in order.
- `Parallel` (`||`): Tasks run concurrently.
- `Forward` (`|->`): Result of LHS is piped into RHS input.

---

## State Backends

*(Advanced)* By default, Volnux manages execution context in-memory. Power users can hook into the state management lifecycle by interfacing with the Backend API.

**Location**: `volnux.backend`

### `BaseBackend`

Abstract class for pipeline state persistence (e.g., saving execution progress to Redis or PostgreSQL).

| Method | Returns | Description |
|--------|---------|-------------|
| `save_state(context_id: str, state: dict)` | `None` | Serializes and saves the pipeline state. |
| `load_state(context_id: str)` | `dict` | Retrieves the saved pipeline state. |

