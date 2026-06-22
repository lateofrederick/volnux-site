Triggers are how workflows start. They watch for conditions — a cron schedule, an event on the bus, a webhook call, a file arriving in S3 — and fire workflows when those conditions are met. Every trigger is a lightweight coroutine in the TriggerEngine. There is no centralized scheduler.

## The Trigger Model
A trigger has one job: wait for a condition, then call `activate(**workflow_params)` to fire a workflow. It doesn't execute the workflow itself. It doesn't manage resources. It doesn't know how the workflow works. It just waits and fires.

```python
class TriggerBase:
    async def start(self): ...
    async def stop(self): ...
    async def pause(self): ...
    async def resume(self): ...
    async def activate(self, **workflow_params): ...
```

All triggers share this interface. The `TriggerEngine` manages their lifecycle — start, stop, pause, resume. The CLI controls them. The `TriggerStateRecord` tracks their state.

Key properties:

* **Lightweight**: Triggers are coroutines. They sleep, wait on subscriptions, or poll with `asyncio.sleep`. They consume kilobytes of memory and near-zero CPU.
* **Independent**: Each trigger operates independently. A stuck trigger doesn't affect others. The `HealthMonitor` restarts failed triggers.
* **Observable**: Every trigger has a `TriggerStateRecord` with `fire_count`, `error_count`, and `last_fired`. The CLI shows real-time status.
* **Controllable**: `volnux triggers pause/resume/stop` controls triggers at runtime via the dirty flag pattern.

## Trigger Types

### ScheduleTrigger
Fires workflows on a cron schedule. Uses Celery Beat for cron evaluation.

```python
from volnux.triggers import ScheduleTrigger

def ready(self):
    self.register_trigger(ScheduleTrigger(
        workflow_name="daily_reconciliation",
        cron="0 6 * * MON-FRI",
        timezone="America/New_York",
        workflow_params={"market": "US", "date": "{{ ds }}"},
    ))
```

Parameters:

| Parameter | Description | Example |
| :--- | :--- | :--- |
| `cron` | Standard cron expression (5-field) | `"0 6 * * MON-FRI"` |
| `timezone` | IANA timezone string | `"America/New_York"` |
| `workflow_params`| Parameters passed to the workflow | `{"market": "US"}` |
| `workflow_name` | Target workflow (optional, inferred from config)| `"daily_reconciliation"` |

The cron expression is standard: minute, hour, day of month, month, day of week. The `{{ ds }}` template variable is replaced with the execution date at runtime.

### EventTrigger
Fires workflows when a matching event appears on the event bus.

```python
from volnux.triggers import EventTrigger

def ready(self):
    self.register_trigger(EventTrigger(
        workflow_name="trade_alert",
        event_type="trade_executed",
        event_filter={"symbol": "AAPL", "volume__gte": 10000},
    ))
```

Parameters:

| Parameter | Description |
| :--- | :--- |
| `event_type` | Type of event to listen for |
| `event_filter` | Django-style field lookups to filter events |
| `workflow_params`| Parameters passed to the workflow |

The `event_filter` uses the same lookup syntax as `previous_result.filter()` — `__gte`, `__contains`, `__in`, etc. Only matching events fire the workflow.

### ConditionalTrigger
Polls a condition function and fires when it returns `True`.

```python
from volnux.triggers import ConditionalTrigger

def ready(self):
    self.register_trigger(ConditionalTrigger(
        workflow_name="process_file",
        condition_fn=lambda: s3_file_exists("bucket/input.csv"),
        edge_trigger=True,
        poll_interval=30.0,
    ))
```

Parameters:

| Parameter | Description |
| :--- | :--- |
| `condition_fn` | Callable returning bool |
| `edge_trigger` | If `True`, fires only on `False`→`True` transitions |
| `poll_interval`| Seconds between checks |

`edge_trigger=True` prevents repeated firing. The condition must transition from False to True to trigger. This is ideal for file arrival: the file appears once, the workflow fires once.

### WebhookTrigger
Exposes an HTTP endpoint that fires a workflow on POST.

```python
from volnux.triggers import WebhookTrigger

def ready(self):
    self.register_trigger(WebhookTrigger(
        workflow_name="github_deploy",
        path="/webhooks/github",
        method="POST",
        hmac_secret=os.environ["GITHUB_WEBHOOK_SECRET"],
    ))
```

Security: Webhook payloads are verified with HMAC-SHA256. The `hmac_secret` is shared between Volnux and the webhook provider. Requests with invalid signatures are rejected before any workflow executes.

### ChainedTrigger
Composes multiple triggers sequentially. Each trigger must fire before the next starts.

```python
from volnux.triggers import ChainedTrigger

def ready(self):
    self.register_trigger(ChainedTrigger(
        workflow_name="process_with_confirmation",
        steps=[
            EventTrigger(event_type="file_uploaded"),
            ConditionalTrigger(condition_fn=lambda: db_check_complete()),
        ],
        step_timeout=3600,
    ))
```

Parameters:

| Parameter | Description |
| :--- | :--- |
| `steps` | List of triggers, executed in order |
| `step_timeout` | Maximum seconds per step |
| `accumulated_data`| Data passed forward between steps |

Each step's result is available to the next step. The workflow fires only when all steps complete. This enables complex triggering logic: "wait for a file upload, then wait for a database check, then fire."

### WindowedTrigger
Accumulates events from multiple sources and fires when a condition is met or a timeout expires.

```python
from volnux.triggers import WindowedTrigger, WindowSink, TimestampFilter

def ready(self):
    self.register_trigger(WindowedTrigger(
        workflow_name="process_market_window",
        aggregators=[
            EventTrigger(
                name="trades",
                event_filter=TimestampFilter(start=0, end=60),
            ),
            EventTrigger(
                name="quotes",
                event_filter=TimestampFilter(start=60, end=80),
            ),
        ],
        sink=WindowSink(
            condition_fn=lambda state: (
                len(state.get("trades", [])) >= 500 and
                len(state.get("quotes", [])) >= 500
            ),
        ),
        window_timeout=300.0,
    ))
```

Architecture:

```d2
direction: right

Event Bus: {
  EB: Event Stream
}

Aggregators: {
  T: "aggregator['trades']"
  Q: "aggregator['quotes']"
  N: "aggregator['news']"
}

WS: window_state { shape: cylinder }
CF: condition_fn { shape: diamond }
FW: Fire Workflow { shape: oval }

Event Bus.EB -> Aggregators.T
Event Bus.EB -> Aggregators.Q
Event Bus.EB -> Aggregators.N

Aggregators.T -> WS
Aggregators.Q -> WS
Aggregators.N -> WS

WS -> CF
CF -> FW: condition met?
CF -> FW: timeout?
```

Parameters:

| Parameter | Description |
| :--- | :--- |
| `aggregators` | Named event sources feeding the window |
| `sink` | `WindowSink` with `condition_fn` and optional timeout |
| `window_timeout` | Maximum window duration in seconds |

The `condition_fn` receives the full `window_state` — a dict mapping aggregator names to accumulated events. It can inspect event content, not just counts or timestamps. This is more expressive than Apache Beam's trigger conditions, which are limited to metadata.

Window reset: After firing (by condition or timeout), the window clears. A new window epoch begins. Aggregators re-arm. The cycle continues.

### ManualTrigger
Enables CLI-initiated execution. Used for testing, operational runs, and development.

```python
def ready(self):
    self.register_trigger(ManualTrigger(
        workflow_name="ad_hoc_report",
        require_approval=False,
    ))
```

In development: `ManualTrigger` is implicit. `volnux workflow run` works without registering anything.

In production: `ManualTrigger` must be explicitly registered. If not registered, `volnux workflow run` is rejected. This prevents accidental production execution.

```python
# Production — manual execution with audit requirement
def ready(self):
    self.register_trigger(ManualTrigger(
        require_approval=True,
        audit_reason_required=True,
    ))
```

### AssetTrigger
Fires when a declared asset is materialized or becomes stale.

```python
from volnux.triggers import AssetTrigger
from volnux.assets import AssetKey

def ready(self):
    self.register_trigger(AssetTrigger(
        asset_key=AssetKey("cleaned_orders"),
        on="stale",  # Fire when asset exceeds freshness policy
        workflow_params={"action": "rematerialize"},
    ))
```

`on="materialized"` fires when the asset is freshly produced. `on="stale"` fires when it exceeds its freshness policy. The asset's `FreshnessPolicy` is declared on the `@asset` decorator.

## The TriggerEngine
All triggers run inside the `TriggerEngine` — a coroutine that manages their lifecycle.

Responsibilities:
* Start/stop triggers on workflow initialization
* Reconcile `TriggerStateRecord` dirty flags (CLI changes)
* Monitor trigger health via the `HealthMonitor`
* Provide observability: `fire_count`, `error_count`, `last_fired`

The `TriggerEngine` is not a centralized scheduler. It's a container for independent coroutines. Each trigger manages its own waiting and firing. The engine provides lifecycle management and observability.

## Trigger Lifecycle
Every trigger has four lifecycle states:

```d2
direction: right
STOPPED -> ACTIVE: start()
ACTIVE -> PAUSED: pause()
PAUSED -> ACTIVE: resume()
ACTIVE -> STOPPED: stop()
PAUSED -> STOPPED: stop()
```

CLI control:

```bash
volnux triggers list                    # View all triggers
volnux triggers pause trade-schedule    # Pause a trigger
volnux triggers resume trade-schedule   # Resume a paused trigger
volnux triggers stop trade-schedule     # Stop a trigger entirely
```

State machine guards: You can't pause a stopped trigger. You can't start an active trigger. Invalid transitions raise clear errors.

## Trigger State and the Dirty Flag
The `TriggerStateRecord` (stored in SQLite) tracks each trigger's state:

```python
class TriggerStateRecord:
    workflow_name: str
    lifecycle: TriggerLifecycle  # ACTIVE, PAUSED, STOPPED
    enabled: bool
    fire_count: int
    error_count: int
    last_fired: Optional[str]
    dirty: bool  # CLI wrote a change the engine hasn't applied yet
```

The dirty flag pattern:
1. CLI writes: `dirty=True`, `lifecycle=PAUSED`
2. `TriggerEngine` polls: sees dirty record
3. Engine applies: pauses the actual trigger
4. Engine marks: `dirty=False`

The CLI doesn't directly control triggers — it writes intent to the database. The engine reads intent and applies it. This enables CLI control across process boundaries without requiring the CLI to connect to the running engine.

## The RehydrationManager
The `RehydrationManager` is a specialised trigger that wakes suspended workflows.

It watches for:
* HITL responses (human clicked "Approve")
* External events (webhook arrived)
* Condition changes (file appeared in S3)

It handles:
* Distributed claim (only one manager processes each response)
* Timeout injection (expired requests get a timeout response)
* Recovery on restart (scans for pending requests on startup)

It's a trigger: The `RehydrationManager` extends `TriggerBase`. It appears in `volnux triggers list`. It can be paused during maintenance. It inherits OTel instrumentation. It's not a separate service — it's part of the same engine.

## Composing Triggers
Triggers compose naturally because they share the same interface:

```python
# Chain triggers for sequential conditions
chain = ChainedTrigger(steps=[file_trigger, db_trigger])

# Window triggers for multi-source accumulation
window = WindowedTrigger(aggregators=[trades, quotes], sink=condition_sink)

# Asset trigger for data-driven execution
asset = AssetTrigger(asset_key=AssetKey("cleaned_orders"), on="stale")
```

Each trigger does one thing. Composing them creates complex triggering logic without complex code. This is the emergent capability pattern: `ChainedTrigger` + `EventTrigger` + `ConditionalTrigger` = Windowing without windowing being explicitly designed in.

## Trigger CLI Commands
```bash
# List all triggers with status
volnux triggers list

# Output:
# NAME                    LIFECYCLE    FIRES    ERRORS    LAST FIRED
# trade-schedule          active       1,423    0         2024-06-19T06:00:00Z
# rehydration-manager     active       892      12        2024-06-19T12:45:00Z
# s3-file-watcher         paused       45       3         2024-06-18T22:00:00Z

# Control triggers
volnux triggers pause trade-schedule
volnux triggers resume trade-schedule
volnux triggers stop s3-file-watcher

# View trigger details
volnux triggers info trade-schedule
```
