Every event produces a result. How that result flows to downstream events, how it's queried, how it's persisted — these are the concerns of the Result Layer. It's the data fabric that connects events in a workflow.

## ResultStream
A `ResultStream` is a lazy, queryable, shardable sequence of `EventResult` objects. It's the abstraction that powers both streaming and batch data flow between events.

### Lazy Evaluation
Results are not materialized until consumed. When an upstream event produces data, it's stored in the dual-backend engine. Downstream events receive a `ResultStream` — a promise of data, not the data itself.

```python
async def process(self, *args, **kwargs):
    # No data fetched yet — just a stream handle
    results = self.previous_result.filter(name="FetchTrades")
    
    # Data is fetched when consumed
    first = await results.first()  # Fetches one record
    all_results = await results    # Fetches all records
```

This means memory is proportional to what you consume, not what was produced. An upstream event that produces 10 million records doesn't create 10 million in-memory objects. The stream fetches records in chunks as needed.

### Chunked Loading
Records are fetched from the persistence backend in configurable chunks:

```python
results = self.previous_result.filter(
    name="FetchTrades"
).chunk_size(1000)  # Fetch 1000 records at a time

async for record in results:
    process(record)
```

The default chunk size balances memory usage and database round-trips. For streaming pipelines with `|->`, the chunk size is derived from the pipeline's `batch_size`.

### shard() for Parallel Consumption
`shard(n)` splits a stream into `n` independent sub-streams. Each shard can be consumed concurrently by a different worker without blocking other shards.

```python
# MAP<ValidateTrade>[max_workers=4] uses shard internally
stream = self.previous_result.filter(name="FetchTrades")
shards = stream.shard(4)

# Worker 1 consumes shard 0: items 0, 4, 8, 12, ...
# Worker 2 consumes shard 1: items 1, 5, 9, 13, ...
# Worker 3 consumes shard 2: items 2, 6, 10, 14, ...
# Worker 4 consumes shard 3: items 3, 7, 11, 15, ...

# All workers pull concurrently. No head-of-line blocking.
```

Shards are created eagerly (you get `N` stream handles immediately) but items are pulled lazily (each worker fetches from its shard at its own pace). Backpressure from one worker doesn't affect others.

### take() for Windows
`take(n)` returns a sub-stream limited to `n` items. It's a window into the parent stream.

```python
stream = self.previous_result.filter(name="FetchTrades")

while await stream.has_next():
    batch = stream.take(50)      # Window of 50 items
    result = await process_batch(batch)  # Process the window
```

`take()` doesn't materialize the window. It returns a `ResultStream` that lazily pulls up to `n` items from the parent. When the window is consumed, the parent stream advances. Memory holds only the current window's active records.

## The previous_result Queryset API
Every event accesses upstream results through `self.previous_result`. It's a queryset — a composable, lazily-evaluated query interface inspired by Django's ORM.

### filter() — Django-Style Lookups
Filter results using field lookups:

```python
# Exact match
results = self.previous_result.filter(name="FetchTrades")

# Comparison operators
results = self.previous_result.filter(price__gt=100.0)
results = self.previous_result.filter(volume__gte=10000)
results = self.previous_result.filter(created_at__lt=yesterday)

# String operations
results = self.previous_result.filter(symbol__contains="AAPL")
results = self.previous_result.filter(status__in=["completed", "validated"])
results = self.previous_result.filter(name__startswith="trade_")

# Null checks
results = self.previous_result.filter(error_message__isnull=True)
```

Supported lookups:

| Lookup | SQL Equivalent | Example |
| :--- | :--- | :--- |
| `exact` (default)| `=` | `name="AAPL"` |
| `iexact` | `ILIKE` (case-insensitive) | `name__iexact="aapl"` |
| `contains` | `LIKE '%value%'` | `desc__contains="trade"` |
| `icontains` | `ILIKE '%value%'` | `desc__icontains="trade"` |
| `startswith` | `LIKE 'value%'` | `name__startswith="trade_"` |
| `gt`, `gte` | `>`, `>=` | `price__gt=100` |
| `lt`, `lte` | `<`, `<=` | `volume__lt=500` |
| `in` | `IN (...)` | `status__in=["a","b"]` |
| `isnull` | `IS NULL` / `IS NOT NULL` | `error__isnull=True` |

The lookup syntax is identical whether the data is in PostgreSQL, Redis, or in-memory. The persistence backend translates lookups to native queries where possible.

### get() — By ID
Retrieve a single result by its unique ID:

```python
result = self.previous_result.get(id="task-abc-123")
```

Returns a single `EventResult` or raises `ObjectDoesNotExist` if not found. Use when you know the exact task ID.

### first() — First Result
Retrieve the first matching result:

```python
result = self.previous_result.first()
result = self.previous_result.filter(status="completed").first()
```

Returns the first `EventResult` in the result set, or `None` if empty. This is the most common access pattern — most events consume a single upstream result.

### order_by() — Sorting
Sort results by any field:

```python
# Ascending
results = self.previous_result.filter(name="trades").order_by("created_at")

# Descending (prefix with -)
results = self.previous_result.order_by("-price")

# Multiple fields
results = self.previous_result.order_by("-price", "volume")
```

The sort is pushed to the persistence backend when possible. PostgreSQL uses `ORDER BY`. In-memory streams sort after fetching.

### Q Objects — Complex Queries
For queries that can't be expressed with simple `filter()` kwargs, use `Q` objects:

```python
from volnux.result.stream import Q

# OR condition
results = self.previous_result.filter(
    Q(name="AAPL") | Q(name="GOOGL")
)

# AND with OR
results = self.previous_result.filter(
    Q(price__gt=100) & (Q(status="completed") | Q(status="validated"))
)

# Negation
results = self.previous_result.filter(
    ~Q(status="failed")
)
```

`Q` objects support `&` (AND), `|` (OR), and `~` (NOT). They compose arbitrarily. The persistence backend translates them to SQL `WHERE` clauses.

## EventResult and is_persisted
Each item in a `ResultStream` is an `EventResult`:

```python
@dataclass
class EventResult:
    content: Any           # The actual data
    task_id: str           # Which event produced it
    error: bool            # Was it an error result?
    is_persisted: bool     # Is it in the persistent backend?
    is_asset: bool         # Is it an asset materialization?
    version: str           # Version of the producing event
```

`is_persisted` is the critical flag for the dual-backend engine:
* `True` — The result is in the persistent backend (PostgreSQL, Redis). It survives process restarts. Downstream events query it from the database.
* `False` — The result is in-memory only. It's fast but ephemeral. If the process crashes, it's lost.

The flag is set by the coordinator based on the event's `persist_result` setting and the result's own metadata. Events declare their persistence intent:

```python
class TransientEvent(EventBase):
    persist_result = ResultPersistence.TRANSIENT  # In-memory only

class DurableEvent(EventBase):
    persist_result = ResultPersistence.DURABLE    # Persist to backend
```

## The Dual-Backend Stream Engine
The stream engine maintains two backends simultaneously:

```d2
direction: down

"Dual-Backend Engine": {
  direction: down
  
  Backends: {
    direction: right
    IM: |markdown
    **In-Memory (fast)**
    • Python dict
    • Zero I/O
    | { shape: parallelogram }
    
    P: |markdown
    **Persistent (durable)**
    • Redis
    • PostgreSQL
    • S3
    | { shape: parallelogram }
  }
  
  RS: ResultStream\n(unified API) { shape: oval }
  
  Backends.IM -> RS
  Backends.P -> RS
}
```

How it works:
* An event produces a result.
* The coordinator checks the event's `persist_result`.
* If `TRANSIENT`, the result stays in the in-memory backend.
* If `DURABLE`, the result is written to the persistent backend.
* Downstream events query via `previous_result`. The `ResultStream` checks the in-memory backend first, then falls back to persistent.

The unified API means event code never knows or cares where the data is:

```python
# This works identically whether the result is in memory or Redis
result = await self.previous_result.filter(name="AAPL").first()
```

## Result Persistence
Events declare their persistence strategy at the class level:

```python
from volnux import ResultPersistence

class ApiResponse(EventBase):
    persist_result = ResultPersistence.TRANSIENT  # Don't persist API responses

class ValidatedTrade(EventBase):
    persist_result = ResultPersistence.DURABLE    # Persist validated trades

class CachedReport(EventBase):
    persist_result = ResultPersistence.CONCRETE   # Already persisted elsewhere
```

Three strategies:

| Strategy | Storage | Survives Restart? | Use Case |
| :--- | :--- | :--- | :--- |
| **TRANSIENT** | In-memory | No | Intermediate results, API responses, temporary calculations |
| **DURABLE** | Persistent backend | Yes | Governed data, audit records, asset materialisations |
| **CONCRETE** | Already persisted | Yes | Bypass results from AssetCatalog, cached materialisations |

The coordinator's persistence logic:
* After the event completes, the coordinator reads `persist_result`.
* `TRANSIENT` → Store in-memory only. Set `is_persisted=False`.
* `DURABLE` → Write to persistent backend. Set `is_persisted=True`.
* `CONCRETE` → Skip write (already persisted). Set `is_persisted=True`.

The event doesn't manage persistence. It returns data. The coordinator handles the rest. This keeps persistence I/O out of the event's execution path and ensures consistent handling across all events.

Per-result override:
A `bypass()` result carries its own `is_persisted` flag. If the flag is `True`, the coordinator treats it as `CONCRETE` regardless of the event's `persist_result` setting. This is how the `@asset` decorator's cache hits work — the materialisation from the AssetCatalog is already persisted, so it's marked `CONCRETE` and the coordinator skips the write.
