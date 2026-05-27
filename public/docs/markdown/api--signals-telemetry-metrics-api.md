# Signals, Telemetry & Metrics API

This section details the classes used for observability in Volnux, including the Soft Signaling framework, Pipeline Metrics, and the OpenTelemetry integration.

---

## `SoftSignal`

The core pub/sub class used to emit and listen to lifecycle events within the framework.

**Location**: `volnux.signal.signals.SoftSignal`

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `__init__(name: str, provide_args: List[str])` | `None` | Initializes a signal. `provide_args` are the keyword arguments listeners should expect. |
| `connect(sender: Any, listener: Callable)` | `None` | Connects a listener function to this signal. If `sender` is `None`, listens to all senders. |
| `disconnect(sender: Any, listener: Callable)`| `None` | Disconnects the listener. |
| `emit(sender: Any, **kwargs)` | `List[Tuple]` | Synchronously emits the signal to all connected listeners. Returns a list of `(listener, response)` tuples. |
| `emit_async(sender: Any, **kwargs)` | `List[Tuple]` | Asynchronously emits the signal using thread pools. |

---

## Standard Signals

Predefined instances of `SoftSignal` available for import from `volnux.signal.signals`.

### Pipeline Signals
- `pipeline_pre_init` (args: `args`, `kwargs`)
- `pipeline_post_init` (args: `pipeline`)
- `pipeline_execution_start` (args: `pipeline`)
- `pipeline_execution_end` (args: `execution_context`)
- `pipeline_shutdown` (args: `pipeline`, `execution_context`)
- `pipeline_stop` (args: `pipeline`, `execution_context`)

### Event Signals
- `event_execution_start` (args: `event`, `execution_context`)
- `event_execution_end` (args: `event`, `execution_context`)
- `event_execution_retry` (args: `event`, `execution_context`, `task_id`, `backoff`, `retry_count`, `max_attempts`)
- `event_execution_failed` (args: `task_profiles`, `execution_context`, `state`)

### Batch Signals
- `batch_pipeline_started` (args: `batch`, `total_pipelines`, `timestamp`)
- `batch_pipeline_finished` (args: `batch`, `metrics`, `success_rate`, `total_duration`, `timestamp`)
- `pipeline_metrics_updated` (args: `batch_id`, `metrics`, `active_count`, `completion_rate`, `timestamp`)

---

## `PipelineExecutionMetrics`

Dataclass that tracks real-time execution metrics during Batch Pipeline processing.

**Location**: `volnux.pipeline.PipelineExecutionMetrics`

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `total_pipelines` | `int` | Total number of pipelines scheduled for the batch. |
| `started` | `int` | Number of pipelines currently started. |
| `completed` | `int` | Number of successfully completed pipelines. |
| `failed` | `int` | Number of failed pipelines. |
| `active` | `int` | Number of workers currently active. |
| `success_rate` | `float` | Percentage of completed vs failed pipelines. |
| `average_duration` | `float` | Average execution time per pipeline in seconds. |

---

## `VolnuxTracerConfig`

Configuration class for setting up OpenTelemetry exports.

**Location**: `volnux.otel.tracer_setup.VolnuxTracerConfig`

### Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `service_name` | `str` | `volnux-service` | The name of your service as it will appear in APM tools. |
| `service_version` | `str` | `1.0.0` | The version string. |
| `environment` | `str` | `production` | Deployment environment tag (e.g., `staging`, `prod`). |
| `datadog_agent_url` | `str` | `None` | Endpoint for the Datadog Agent OTLP receiver (e.g. `http://localhost:4317`). |
| `tempo_endpoint` | `str` | `None` | Endpoint for Grafana Tempo / Grafana Agent. |
| `otlp_endpoint` | `str` | `None` | Generic OTLP gRPC endpoint. |
| `custom_attributes` | `dict` | `{}` | Global span attributes applied to every trace. |

---

## `VolnuxTracer`

The singleton manager that initializes and holds the OpenTelemetry tracer instance.

**Location**: `volnux.otel.tracer_setup.VolnuxTracer`

### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `initialize(config: VolnuxTracerConfig)` | `Tracer` | Initializes the global OpenTelemetry provider based on the config. |
| `get_instance()` | `VolnuxTracer` | Returns the initialized singleton. |
| `shutdown()` | `None` | Flushes traces and shuts down the OTLP provider. |

