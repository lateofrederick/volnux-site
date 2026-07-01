Volnux handles streaming data through two complementary mechanisms: the `|->` streaming pipe for memory-bounded data flow between events, and the `WindowedTrigger` for time-based or condition-based window accumulation. Together, they enable continuous processing of unbounded data with governed execution guarantees.

## Streaming with `|->`
The streaming pipe operator enables downstream events to begin processing before upstream events complete. Data flows in batches, not as a single materialised collection.

```pointy
FetchTrades |-> ProcessTrades |-> SaveTrades
```

How it works:
* `FetchTrades` produces results as a `ResultStream`
* `ProcessTrades` consumes batches from the stream while `FetchTrades` is still producing
* `SaveTrades` writes results while `ProcessTrades` is still processing
* The pipeline depth (3 events) × batch size determines peak memory

## When to Use `|->` vs `->`
Both operators are sequential, the upstream event completes before the downstream event starts. The difference is what happens with data.

| | `->` (Control Flow) | `\|->` (Data + Control Flow) |
| :--- | :--- | :--- |
| **What it does** | Passes execution control only | Passes execution control AND data |
| **Data flow** | No data passed, `self.previous_result` is the EMPTY sentinel | A's results are available to B through `self.previous_result` |
| **When downstream starts** | After upstream completes | After upstream completes |
| **Memory** | N/A, no data passed | Data fetched lazily from persistence backend in chunks |
| **Use case** | Orchestration, independent steps, approvals, notifications | Data pipelines, ETL, batch processing |

`->` is for orchestration. Events connected by `->` are independent steps that happen to run in order. `ApproveOrder -> ExecuteTrade -> SendConfirmation`, each step does its own thing. No data flows through the pipe. `self.previous_result` is the EMPTY sentinel.

`|->` is for data pipelines. Events connected by `|->` share data. `FetchOrders |-> ValidateOrders |-> SaveOrders`, each step receives the previous step's results through `self.previous_result` and passes its own results forward.

Data access is lazy, not eager. When B runs after A completes, `self.previous_result` returns a `ResultStream` backed by the persistence backend. The stream does not contain materialized data, it fetches records in chunks when evaluated (via `.first()`, iteration, `.filter()`). This means B can process A's results without loading the entire dataset into its worker's memory. For 10 million records, B's peak memory is bounded by the chunk size, not the total data size. B holds a worker slot while it processes, but it's actively working, A has already finished, and the data is available. B just accesses it efficiently.

True streaming across workflow instances. Within a single workflow execution, events run sequentially. To achieve continuous processing of unbounded data streams, trigger multiple executions of the same workflow. The WindowedTrigger accumulates events and fires the workflow when a window is complete. Multiple workflow executions can run concurrently, each processing its own window of data. This is how Volnux handles streaming, not within a single workflow, but across many executions of the same workflow, each handling a portion of the stream.

Streaming with Meta Events:

```pointy
FetchTrades |-> MAP<ValidateTrade>[batch_size=50] |-> SaveTrades
```

`FetchTrades` completes first. Its results are persisted. `MAP<ValidateTrade>` runs next, splitting the persisted results into batches of 50. Each batch gets its own `ValidateTrade` execution, which accesses its batch lazily from the stream. Results from MAP are persisted. `SaveTrades` runs last, accessing the validated results lazily. At any moment, each worker holds at most its current chunk of data plus its working state.

## The WindowedTrigger
While `|->` handles streaming data flow between events, `WindowedTrigger` handles time-based or condition-based accumulation before the workflow starts. It collects events from multiple sources and fires the workflow when a window is complete.

### Multi-Source Aggregation
A `WindowedTrigger` aggregates events from multiple named sources into a shared `window_state`:

```python
from volnux.triggers import WindowedTrigger, WindowSink, TimestampFilter, EventTrigger

def ready(self):
    self.register_trigger(WindowedTrigger(
        workflow_name="process_market_window",
        aggregators=[
            EventTrigger(
                name="trades",
                event_type="trade_executed",
                event_filter=TimestampFilter(start=0, end=60),
            ),
            EventTrigger(
                name="quotes",
                event_type="quote_updated",
                event_filter=TimestampFilter(start=60, end=80),
            ),
            EventTrigger(
                name="news",
                event_type="news_published",
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

EB: Event Bus { shape: cylinder }

WindowedTrigger: {
  direction: down
  
  Aggregators: {
    direction: down
    T: "aggregator['trades']"
    Q: "aggregator['quotes']"
    N: "aggregator['news']"
  }
  
  WS: window_state { shape: cylinder }
  CF: condition check { shape: diamond }
  FW: Fires workflow { shape: oval }
  
  Aggregators.T -> WS
  Aggregators.Q -> WS
  Aggregators.N -> WS
  
  WS -> CF: state
  CF -> FW: True
}

EB -> WindowedTrigger.Aggregators
```

Each aggregator writes incoming events into its named slot in `window_state`. The sink periodically evaluates `condition_fn(window_state)`. When the condition returns `True`, the workflow fires with the full accumulated state.

### Condition Functions
The `condition_fn` is arbitrary Python. It receives the complete `window_state` — a dict mapping aggregator names to lists of accumulated events. It can inspect event content, run statistical tests, or call external services.

Simple count-based condition:
```python
condition_fn=lambda state: (
    len(state.get("trades", [])) >= 500 and
    len(state.get("quotes", [])) >= 500
)
```

Content-based condition (unique to Volnux):
```python
def condition_fn(state):
    trades = state.get("trades", [])
    if not trades:
        return False
    
    avg_price = sum(t["price"] for t in trades) / len(trades)
    return avg_price > threshold
```

Statistical condition:
```python
def condition_fn(state):
    trades = state.get("trades", [])
    if len(trades) < 100:
        return False
    
    prices = [t["price"] for t in trades]
    volatility = np.std(prices) / np.mean(prices)
    return volatility > 0.05  # Fire on high volatility
```

ML-based condition:
```python
def condition_fn(state):
    trades = state.get("trades", [])
    if len(trades) < 50:
        return False
    
    features = extract_features(trades)
    anomaly_score = anomaly_detector.predict(features)
    return anomaly_score > 0.95
```

This expressiveness exceeds Apache Beam's trigger conditions, which are limited to element count, processing time, and watermark progression. Volnux can close a window based on the content of the data, not just its metadata.

### Window Timeout
If the condition never fires, the `window_timeout` acts as a safety net. When the timeout expires, the workflow fires with whatever data has accumulated.

```python
WindowedTrigger(
    window_timeout=300.0,  # 5 minutes max
    ...
)
```

After firing (by condition or timeout), the window resets:
* `window_state` is cleared
* A new `window_epoch` is stamped
* All aggregators re-arm
* The sink resumes evaluating

Each window epoch is independent. The workflow receives exactly the data accumulated in that window. No cross-epoch contamination.

### Comparison with Apache Beam
Both Volnux and Beam provide event-time windowing with triggers and watermarks. The architectural difference is where the window lives:

**Beam:** Windowing is pervasive. Every transform after `WindowInto` is window-aware. The window is part of every element's identity. This enables per-element window-aware processing but adds complexity to every downstream operation.

**Volnux:** Windowing is contained. The `WindowedTrigger` is a boundary. Inside the trigger, events are accumulated and windows are evaluated. The workflow that fires is not window-aware — it receives a batch and processes it normally.

| Feature | Apache Beam | Volnux |
| :--- | :--- | :--- |
| **Window scope** | Pervasive — affects all downstream transforms | Contained — boundary at trigger |
| **Trigger conditions**| Element count, processing time, watermark | All of the above + content inspection |
| **Multi-source** | Side inputs, `CoGroupByKey` | Named aggregators → shared state |
| **Post-window processing**| More Beam transforms | Full Volnux workflow (governance, HITL, checkpointing) |
| **Condition expressiveness**| Metadata only | Arbitrary Python |

## Implicit Windowing via Meta Events
Meta Events provide implicit windowing inside workflows:

```pointy
FetchData |-> MAP<ProcessBatch>[batch_size=50] |-> REDUCE<AggregateResults>
```

`MAP` with `batch_size=50` creates windows of 50 items. Each window is a discrete `ProcessBatch` execution. `REDUCE` aggregates the results across windows. The window size is declared in Pointy-Lang — static, readable, auditable.

This is different from the `WindowedTrigger`:
* **WindowedTrigger**: Time-based or condition-based accumulation before the workflow starts. The workflow receives the closed window.
* **Meta Events**: Data-based batching inside the workflow. The streaming pipe feeds data. Meta Events divides it into windows.

They can be combined:

```pointy
# Trigger accumulates a 5-minute window of trades
# Workflow processes them in batches of 50
WindowedTrigger[...] -> FetchWindow |-> MAP<ValidateTrade>[batch_size=50] -> SaveResults
```

## Memory Bounds and Backpressure
Streaming in Volnux is memory-bounded at every level:

**Between events (`|->`)**:
`Peak memory = batch_size × pipeline_depth`

The `ResultStream` buffers one batch per active downstream event. When a buffer is full, the upstream event is blocked from producing more. Backpressure is automatic through async/await.

**Inside the WindowedTrigger**:
`Peak memory = accumulated events in the current window`

The `window_state` dict holds accumulated events until the condition fires or timeout expires. The `condition_fn` should be designed to fire before memory becomes a concern. The `window_timeout` provides an upper bound.

**Inside Meta Events**:
`Peak memory = batch_size × max_workers`

`MAP<Event>[batch_size=50, max_workers=4]` holds at most 200 items in flight. Each worker processes one batch. Completed batches are passed downstream. New batches are pulled from the stream.

## ResultStream and Lazy Evaluation
The `ResultStream` is the abstraction that makes streaming efficient. It's a lazy iterator over results, backed by the dual-backend stream engine.

Key properties:
* **Lazy**: Results are fetched only when consumed. No materialisation of the entire stream.
* **Shardable**: `stream.shard(n)` returns `n` independent sub-streams. Each can be consumed concurrently without blocking others.
* **Windowable**: `stream.take(n)` returns a sub-stream limited to `n` items.
* **Countable**: `stream.count()` is O(1) — it returns `len(self.keys)`, known from the backend query.
* **Queryable**: The `previous_result` queryset API returns `ResultStream` objects. `filter()`, `order_by()`, `first()` all produce streams.

Dual backend:
* **In-memory**: Fast, ephemeral. Used for TRANSIENT results.
* **Persistent**: Redis, PostgreSQL, or S3. Used for DURABLE results.

The stream API is identical regardless of backend. The event author writes `self.previous_result.filter(name="AAPL")` and gets a `ResultStream`. The framework routes the query to the appropriate backend.
