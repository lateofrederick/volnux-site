# Telemetry & Observability

Volnux provides a comprehensive strategy for observability by deeply integrating with **OpenTelemetry (OTEL)**. The framework supports native distributed tracing and metrics collection, enabling seamless exports to backends like Datadog, Grafana/Tempo, or any standard OTLP collector.

## Architecture

Volnux instruments pipelines at multiple layers to give you complete visibility into the orchestration hierarchy. When instrumented, your spans will look like this:

```text
workflow.MyPipeline [2.5s] (Root Span)
├── engine.execute [2.4s]
│   ├── engine.process_task [0.8s]
│   │   ├── context.dispatch [0.75s]
│   │   │   ├── coordinator.execute [0.7s]
│   │   │   │   ├── flow.setup [0.05s]
│   │   │   │   ├── flow.run [0.6s]
│   │   │   │   │   ├── task.execute:FetchData [0.3s]
│   │   │   │   │   └── task.execute:ProcessData [0.3s] (Parallel)
```

## Initialization & Setup

To enable observability, you need to configure the `VolnuxTracerConfig` and initialize the tracer, ideally during application startup.

```python
from volnux.otel.tracer_setup import VolnuxTracerConfig, VolnuxTracer
from volnux.otel.context_coordinator_instrumentation import patch_all_execution_components
from volnux.otel.pipeline_signal_instrumentation import patch_all_pipeline_components

def initialize_observability():
    # 1. Configure the Tracer
    config = VolnuxTracerConfig(
        service_name="volnux-workflows",
        service_version="1.0.0",
        environment="production",
        
        # Uncomment based on your backend:
        # datadog_agent_url="http://localhost:4317",
        # tempo_endpoint="http://tempo:4317",
        otlp_endpoint="http://otel-collector:4317",
        
        custom_attributes={
            "team": "data-platform"
        }
    )

    # 2. Initialize
    tracer = VolnuxTracer.initialize(config)
    
    # 3. Patch Volnux Components (Auto-instruments Pipeline & Events)
    patch_all_execution_components()
    patch_all_pipeline_components()

# Call this once at startup
initialize_observability()
```

Once initialized, all `pipeline.start()` executions and their underlying events will be automatically traced.

## Custom Instrumentation

While Volnux handles the orchestration spans automatically, you might want to add custom attributes or trace custom functions inside your event logic.

### Adding Custom Attributes

You can extract the current span inside your event's `process` method and append business-specific attributes:

```python
from opentelemetry import trace
from volnux import EventBase

class ProcessData(EventBase):
    def process(self, dataset, **kwargs):
        span = trace.get_current_span()
        
        if span.is_recording():
            span.set_attribute("dataset.size", len(dataset))
            span.add_event("data_processed", {"records_processed": len(dataset)})
            
        return True, "Done"
```

### Manual Tracing

To trace an arbitrary function outside the standard event flow:

```python
from volnux.otel.tracer_setup import get_tracer

def my_custom_function():
    tracer = get_tracer()
    if tracer:
        with tracer.start_as_current_span("my_custom_operation") as span:
            span.set_attribute("operation.type", "data_transformation")
            # ... function logic ...
```

## Distributed Tracing

For workflows that execute across multiple microservices or distributed workers, you need to propagate the OpenTelemetry context. Volnux provides the `OTelContextManager` to serialize and deserialize the trace context.

**Service A (The Caller)**:
```python
from volnux.otel.context_manager import OTelContextManager

execution_context = pipeline.start()
trace_context = OTelContextManager.serialize_context(execution_context)

# Send `trace_context` string over the wire (e.g., via a message broker)
send_to_worker(task_data, trace_context=trace_context)
```

**Service B (The Worker)**:
```python
from volnux.otel.context_manager import OTelContextManager
from volnux.otel.tracer_setup import get_tracer

def worker_process(task_data, trace_context):
    # Reconstruct parent context
    parent_context = OTelContextManager.deserialize_context(trace_context)
    
    tracer = get_tracer()
    with tracer.start_as_current_span(
        "worker.process_task",
        context=parent_context
    ) as span:
        # This span will correctly appear as a child of the original workflow span
        return do_work(task_data)
```

## Metrics Collection

Beyond tracing, the `volnux.otel` module automatically tracks metrics like workflow duration, execution error rates, and parallel task counts. You can view these metrics by configuring an OTLPMetricExporter in your application.

