Volnux instruments itself. Event authors write business logic. The framework emits traces, metrics, and signals automatically. Every phase transition, every checkpoint, every retry, every cross-node call is captured without user code.

## OpenTelemetry Integration
Volnux uses OpenTelemetry as its native observability backbone. Every event execution is a span. Every workflow is a trace. The fractal execution tree maps directly to the OTel span hierarchy.

### Automatic Spans per Lifecycle Phase
The framework creates spans for every lifecycle phase automatically:

```text
Workflow: trade-reconciliation (trace)
├── Event: FetchData (span)
│   ├── Phase: INITIALIZED (span event)
│   ├── Phase: COMMUNICATING (span event)
│   ├── Phase: PRE_PROCESS (span event)
│   ├── Phase: PROCESSING (span event)
│   │   ├── Tool: FetchMarketData (child span)
│   │   │   ├── Phase: PROCESSING (span event)
│   │   │   └── Result: success (attribute)
│   │   └── Tool: CalculateRisk (child span)
│   │       ├── Phase: PROCESSING (span event)
│   │       └── Result: success (attribute)
│   ├── Phase: POST_PROCESS (span event)
│   └── Phase: COMPLETED (span event)
├── Event: ValidateTrade (span)
│   └── ...
└── Event: SaveResults (span)
    └── ...
```

Span attributes (automatic):

| Attribute | Description | Example |
| :--- | :--- | :--- |
| `event.name` | Event class name | "FetchData" |
| `event.version` | Event version | "1.2.0" |
| `event.executor` | Executor type | "RustExecutor" |
| `workflow.name` | Workflow name | "trade-reconciliation" |
| `workflow.version` | Workflow version | "2.1.0" |
| `task.id` | Unique task identifier | "task-abc-123" |
| `task.retry_count` | Current retry attempt | 0 |
| `task.phase` | Current lifecycle phase | "PROCESSING" |

Span events (automatic):

| Event | When |
| :--- | :--- |
| `phase.entered` | Entering a lifecycle phase |
| `phase.completed` | Exiting a lifecycle phase |
| `checkpoint.enqueued` | Snapshot pushed to queue |
| `checkpoint.persisted` | Snapshot written to backend |
| `retry.started` | Retry attempt begins |
| `bypass.skipped` | Event skipped via `bypass()` |
| `goto.called` | Dynamic routing invoked |

The event author writes `return True, result`. The framework produces a complete trace with timing, attributes, and events. Zero instrumentation code.

### Fractal Trace Tree
Volnux's `ExecutionContext` is a tree — parent contexts, child contexts, subgraphs, Meta Events. The OTel trace mirrors this structure exactly.

```pointy
A -> {B -> {C, D}, E} -> F
```

Trace: `workflow-execution`
```text
├── Span: A
├── Span: {} (subgraph)
│   ├── Span: B
│   ├── Span: {} (nested subgraph)
│   │   ├── Span: C
│   │   └── Span: D
│   └── Span: E
└── Span: F
```

The trace tree matches the Pointy-Lang structure. A slow subgraph is immediately visible as a parent span with slow children. The fractal execution tree from the architecture document is the OTel trace.

### Cross-Node Propagation
When a deferred task executes on a remote node, the OTel trace context propagates across the wire:

```text
Node A (trace origin):
├── Span: LoadData
├── Span: CalculateRisk (remote)
│   [trace context sent via gRPC metadata]
│
Node B (remote execution):
└── Span: CalculateRisk (child of Node A's span)
    ├── Phase: PROCESSING
    └── Result: success
```

The remote execution appears as a child span in the same trace. An operator sees the full workflow execution, not two separate traces. The network boundary is invisible in the observability layer.

Propagation protocols:
* **gRPC**: Trace context in gRPC metadata headers
* **XML-RPC**: Trace context in HTTP headers
* **TCP**: Trace context in JSON payload envelope

## Soft Signals
Soft signals are structured events emitted by the framework at significant lifecycle transitions. They're not logs — they're typed, queryable, and alertable.

```python
# Framework emits automatically
SoftSignal.emit(
    "task_suspended",
    task_id="task-abc-123",
    event_class="ApproveTrade",
    reason="hitl_requested",
    suspension_time=1718832000.0,
    timeout=14400.0,  # 4 hours
)
```

Standard soft signals:

| Signal | Description | Payload |
| :--- | :--- | :--- |
| `task_suspended` | Event suspended for HITL or external wait | task_id, reason, timeout |
| `task_rehydrated` | Event resumed from suspension | task_id, suspension_duration |
| `task_preempted` | Event preempted by command channel | task_id, reason, checkpoint_id |
| `checkpoint_merged` | Multiple snapshots collapsed | event_id, snapshots_merged |
| `stale_asset_detected` | Asset exceeded freshness policy | asset_key, age_seconds |
| `backtrack_triggered` | Upstream rematerialization started | asset_key, reason |
| `retry_exhausted` | Max retries reached | task_id, attempts, last_error |
| `break_glass_invoked` | Emergency access used | user, workflow, reason |
| `delegation_activated` | Authority transferred | delegator, delegate, scope |
| `tool_permission_denied` | Undeclared tool called | agent, tool_name, caller |
| `agent_token_usage` | LLM token consumption | agent, prompt_tokens, completion_tokens |

Consuming soft signals:
Soft signals are emitted as OTel span events and can be exported to any backend that supports OTel:

```python
# Route to alerting system
@soft_signal_handler("retry_exhausted")
async def on_retry_exhausted(signal):
    await pagerduty.alert(f"Task {signal.task_id} exhausted retries")

# Route to analytics
@soft_signal_handler("agent_token_usage")
async def on_token_usage(signal):
    await analytics.record({
        "agent": signal.agent,
        "tokens": signal.completion_tokens,
        "timestamp": signal.timestamp,
    })
```

## Prometheus Metrics
Volnux exports metrics via the OpenTelemetry Prometheus exporter:

```python
# config.py
OTEL_METRICS_EXPORTER = "prometheus"
PROMETHEUS_PORT = 9464
```

Standard metrics:

| Metric | Type | Description |
| :--- | :--- | :--- |
| `volnux_workflow_duration_seconds` | Histogram | End-to-end workflow duration |
| `volnux_event_duration_seconds` | Histogram | Per-event execution time |
| `volnux_event_phase_duration_seconds` | Histogram | Per-phase timing |
| `volnux_checkpoint_write_seconds` | Histogram | Checkpoint persistence time |
| `volnux_checkpoint_queue_depth` | Gauge | Pending checkpoints in queue |
| `volnux_executor_pool_active` | Gauge | Active executor slots |
| `volnux_executor_pool_available` | Gauge | Available executor slots |
| `volnux_trigger_fire_count` | Counter | Total trigger activations |
| `volnux_trigger_error_count` | Counter | Trigger failures |
| `volnux_hitl_pending_count` | Gauge | Awaiting human response |
| `volnux_agent_token_count` | Counter | Total LLM tokens consumed |
| `volnux_retry_count` | Counter | Total retry attempts |
| `volnux_bypass_hit_count` | Counter | Cache hits from `bypass()` |

## Grafana Dashboards
Volnux ships with pre-built Grafana dashboard templates:

**Workflow Overview Dashboard:**
* Workflow success/failure rates
* Average workflow duration
* Active workflow count
* Top workflows by execution count

**Event Performance Dashboard:**
* Per-event latency (p50, p95, p99)
* Phase-level timing breakdown
* Executor pool utilization
* Retry rates by event type

**Trigger Dashboard:**
* Trigger fire counts and error rates
* Trigger lifecycle state (active/paused/stopped)
* Last fired timestamps
* WindowedTrigger accumulation stats

**Agent Dashboard:**
* Token consumption per agent and per model
* Reasoning steps per execution
* Tool call frequency and success rates
* Handoff patterns

**Infrastructure Dashboard:**
* Checkpoint queue depth and write latency
* P2P mesh node count and health
* Bridge node status
* HealthMonitor restart counts

Setup:

```yaml
# docker-compose.yml
services:
  grafana:
    image: grafana/grafana
    ports:
      - "3000:3000"
    volumes:
      - ./dashboards:/etc/grafana/provisioning/dashboards
```

The dashboards are JSON files in the Volnux repository. Import them into Grafana. Point at the Prometheus endpoint. Dashboards populate automatically.

## The Audit Trail
Every OTel trace is an audit record. The complete execution history is queryable, exportable, and replayable.

### What is Recorded
Per workflow execution:
* Workflow name, version, and mode
* Trigger that initiated execution
* Parameters passed to the workflow
* Start time, end time, duration
* Final status (completed, failed, cancelled, paused)

Per event execution:
* Event class, version, and executor
* Every phase transition with timestamps
* Result (success/failure, data summary)
* Retry count and retry reasons
* Resources acquired and released
* Upstream results consumed

Per agent reasoning step:
* LLM provider, model, and prompt version
* Token consumption (prompt, completion, total)
* Action taken (tool call, handoff, finish, think)
* Tool calls with parameters and results
* Handoff targets with context

Per human interaction:
* HITL request details (title, payload, timeout)
* Human response (decision, reviewer identity, timestamp)
* Suspension duration

### Querying the Audit Trail
The audit trail is queryable via the REST API and CLI:

```bash
# Query by workflow
volnux audit query --workflow trade-reconciliation --since 2024-06-01

# Query by event
volnux audit query --event CalculateRisk --status failed

# Query by time range
volnux audit query --since "2024-06-01T00:00:00Z" --until "2024-06-19T23:59:59Z"

# Query by agent
volnux audit query --agent TradingAnalyst --prompt-version 1.2.0

# Query by HITL status
volnux audit query --hitl-status pending
```

REST API:

```bash
curl -H "Authorization: Bearer $TOKEN" \
  "https://volnux.internal/api/v1/audit?workflow=trade-reconciliation&status=failed"
```

Example response:

```json
{
    "executions": [
        {
            "workflow": "trade-reconciliation",
            "execution_id": "exec-def-456",
            "status": "failed",
            "failed_event": "CalculateRisk",
            "error": "Division by zero",
            "retry_count": 3,
            "duration_seconds": 45.2,
            "trace_id": "0af7651916cd43dd8448eb211c80319c"
        }
    ]
}
```

### Long-Term Retention
OTel traces can be exported to long-term storage:

**Tempo (Grafana):**
* Native OTLP ingestion
* Integration with Grafana dashboards
* Configurable retention periods

**PostgreSQL (Volnux native):**
* `ExecutionTrace` model stores structured execution data
* Queryable via the same REST API and ORM
* Retained according to governance policy (default: 7 years for compliance)

**S3 / BigQuery (custom export):**
* OTel Collector pipeline exports to object storage
* Suitable for organisations with existing data lake infrastructure
* Parquet format for efficient querying

The audit trail is the system of record for compliance. Every execution, every decision, every human interaction is captured. An auditor can trace any data product back to the exact workflow, event, and code version that produced it. This is not a feature added to a workflow engine. It's the foundation the engine is built on.
