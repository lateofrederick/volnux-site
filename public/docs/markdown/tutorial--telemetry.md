# Telemetry

## Telemetry Overview

The event-pipeline library includes built-in telemetry capabilities for monitoring and tracking event execution, performance metrics, and network operations. The telemetry module provides:

- Event execution tracking (timing, success/failure, retries)
- Network operation monitoring for remote execution
- Performance metrics collection
- JSON-formatted metrics output

## Telemetry Usage

To enable telemetry collection in your pipeline:

```python
from volnux.telemetry import monitor_events, get_metrics

# Enable telemetry collection
monitor_events()

# Run your pipeline...

# Get metrics after execution
metrics_json = get_metrics()
print(metrics_json)

# Get specific metrics
failed_events = get_failed_events()
slow_events = get_slow_events(threshold_seconds=2.0)
retry_stats = get_retry_stats()
```

The telemetry module automatically tracks:
- Event execution time
- Success/failure status
- Error messages
- Retry attempts
- Process IDs

## Network Telemetry

For pipelines using remote execution, the telemetry module provides detailed network operation metrics:

```python
from volnux.telemetry import get_failed_network_ops, get_slow_network_ops

# Get metrics for failed network operations
failed_ops = get_failed_network_ops()

# Get metrics for slow network operations (> 1 second)
slow_ops = get_slow_network_ops(threshold_seconds=1.0)
```

Network telemetry tracks:
- Operation latency
- Bytes sent/received
- Connection errors
- Host/port information

The telemetry data can be used to:
- Monitor pipeline performance
- Identify bottlenecks
- Debug failures
- Optimize remote operations
- Track retry patterns

## Metrics Publishing

The telemetry module supports publishing metrics to various monitoring systems through a flexible publisher adapter system. This allows you to visualize and analyze pipeline metrics using your preferred monitoring tools.

### Available Publishers

#### Elasticsearch Publisher
Publishes metrics to Elasticsearch, allowing visualization in Kibana:

```python
from volnux.telemetry import ElasticsearchPublisher

es_publisher = ElasticsearchPublisher(
    hosts=["localhost:9200"],
    index_prefix="pipeline-metrics"
)
monitor_events([es_publisher])
```

#### Prometheus Publisher
Exposes metrics for Prometheus scraping, compatible with Grafana:

```python
from volnux.telemetry import PrometheusPublisher

prometheus_publisher = PrometheusPublisher(port=9090)
monitor_events([prometheus_publisher])
```

#### Grafana Cloud Publisher
Publishes metrics directly to Grafana Cloud:

```python
from volnux.telemetry import GrafanaCloudPublisher

grafana_publisher = GrafanaCloudPublisher(
    api_key="your-api-key",
    org_slug="your-org"
)
monitor_events([grafana_publisher])
```

#### Composite Publisher
Publish metrics to multiple backends simultaneously:

```python
from volnux.telemetry import CompositePublisher

publisher = CompositePublisher([
    es_publisher,
    prometheus_publisher,
    grafana_publisher
])
monitor_events([publisher])
```

### Dashboard Templates

Sample dashboard templates are provided in the examples directory:

#### Prometheus + Grafana Dashboard
The `examples/telemetry/prometheus_dashboard.json` template includes:
- Event duration metrics
- Retry statistics
- Network throughput
- Latency tracking

Import into Grafana after configuring Prometheus as a data source.

#### Elasticsearch + Kibana Dashboard
The `examples/telemetry/elasticsearch_dashboard.json` template includes:
- Event duration distribution
- Status breakdown
- Network performance metrics
- Error tracking

Import into Kibana after setting up the index pattern.

### Installation

To use metrics publishing, install the required dependencies:

```bash
pip install "event-pipeline[metrics]"
```

This will install the optional dependencies needed for each publisher:
- elasticsearch-py for Elasticsearch
- prometheus-client for Prometheus
- requests for Grafana Cloud

### Custom Publishers

You can create custom publishers by implementing the MetricsPublisher interface:

```python
from volnux.telemetry import MetricsPublisher

class CustomPublisher(MetricsPublisher):
    def publish_event_metrics(self, metrics: EventMetrics) -> None:
        # Implement event metrics publishing
        pass

    def publish_network_metrics(self, metrics: dict) -> None:
        # Implement network metrics publishing
        pass
```
