Assets transform Volnux from an execution engine into a data-aware platform. An asset is a governed, versioned, lineage-tracked data product. The `@asset` decorator adds data semantics to events — materialization tracking, freshness policies, upstream versioning, and automatic cache hits.

## The @asset Decorator
The `@asset` decorator marks an event as a data producer. It declares what data the event produces, how fresh it must be, and how it relates to other assets.

```python
from volnux.assets import asset, AssetKey, FreshnessPolicy

@asset(
    key=AssetKey("cleaned_orders"),
    description="Orders with nulls removed and duplicates eliminated",
    group="order_processing",
    freshness_policy=FreshnessPolicy(maximum_lag_minutes=60),
)
class CleanOrdersEvent(EventBase):
    async def process(self, **kwargs):
        raw = await self.previous_result.first()
        cleaned = [order for order in raw.content if order is not None]
        return True, cleaned
```

The decorator patches the event class at definition time. It injects:
* A `bypass()` method that checks the AssetCatalog for fresh materializations
* A `_post_process` hook that records materialization metadata
* Asset lineage tracking based on `previous_result` consumption

The event author writes a normal `EventBase` subclass. The decorator adds data governance transparently.

## AssetKey and AssetVersion
Every asset has a unique key and a version:

```python
@asset(
    key=AssetKey("cleaned_orders"),
    version="1.2.0",
)
```

**AssetKey**: A globally unique identifier for the asset. Used to query the `AssetCatalog`, declare dependencies, and track lineage. Keys follow a namespace convention: `group.asset_name` or just `asset_name` for top-level assets.

**AssetVersion**: The schema version of the asset. When the event's output format changes, increment the version. Downstream consumers can pin to specific versions. The `AssetCatalog` tracks which version was consumed by each downstream asset.

If `version` is omitted, it defaults to the event's `version` attribute.

## FreshnessPolicy
A freshness policy declares how often an asset should be rematerialized:

```python
FreshnessPolicy(
    maximum_lag_minutes=60,       # Must be materialized at least every hour
    cron_free=True,               # Don't tie to a schedule — check on access
)
```

Parameters:

| Parameter | Description | Example |
| :--- | :--- | :--- |
| `maximum_lag_minutes` | Maximum age before considered stale | 60 (1 hour) |
| `maximum_lag_seconds` | Alternative in seconds | 3600 |
| `cron_free` | If True, staleness is checked on access, not on a schedule | True |

How staleness is checked:
* A downstream event is about to consume the asset.
* The framework calls `AssetCatalog.is_stale(asset_key)`.
* The catalog checks the latest materialization timestamp.
* If the asset is older than `maximum_lag_minutes`, it's stale.
* If any upstream asset has a newer version than what was consumed, it's stale.
* If stale, the `bypass()` method returns `None` — the event executes normally, producing a fresh materialization.
* If fresh, the `bypass()` method returns the cached materialization — the event is skipped.

## The AssetMaterialisation Model
Every time an asset event completes successfully, the framework records a materialization:

```python
class AssetMaterialisation(KeyValueStoreIntegrationMixin, BaseModel):
    asset_key: str                          # What was produced
    asset_version: str                      # Schema version
    producing_event: str                    # What code produced it
    producing_event_version: str            # Version of that code
    workflow_id: str                        # Which workflow
    execution_id: str                       # Which execution
    task_id: str                            # Which task instance
    upstream_versions: Dict[str, str]       # What inputs were used
    metadata: Dict[str, Any]                # Operational details
    created_at: float                       # When
```

Every field answers a governance question:
* **What?** `asset_key` + `asset_version`
* **Who?** `producing_event` + `producing_event_version`
* **In what context?** `workflow_id` + `execution_id` + `task_id`
* **From what inputs?** `upstream_versions` — a map of every upstream asset and its version
* **When?** `created_at`
* **How?** `metadata` — record counts, processing time, data quality metrics

`upstream_versions` is the lineage link:

```json
{
    "asset_key": "cleaned_orders",
    "upstream_versions": {
        "raw_orders": "1.0.0",
        "customer_profiles": "2.3.1"
    }
}
```

When `cleaned_orders` was produced, it consumed `raw_orders` version 1.0.0 and `customer_profiles` version 2.3.1. If either is later rematerialized at a newer version, `cleaned_orders` becomes stale — its inputs have changed.

## The AssetCatalog
The `AssetCatalog` is the queryable system of record for asset metadata. It's backed by PostgreSQL (governance data) with the same formax ORM as every other model.

### is_stale()
Check whether an asset needs rematerialization:

```python
catalog = AssetCatalog()

# Time-based staleness
is_stale = await catalog.is_stale(AssetKey("cleaned_orders"))
# True if last materialization > 60 minutes ago

# Version-based staleness
is_stale = await catalog.is_stale(
    AssetKey("cleaned_orders"),
    consumed_upstream={"raw_orders": "1.0.0"}
)
# True if raw_orders has been materialized at a version newer than 1.0.0
```

Staleness logic:

```python
async def is_stale(asset_key, consumed_upstream=None):
    latest = await get_latest_materialization(asset_key)
    
    if latest is None:
        return True  # Never materialized
    
    # Check time-based freshness
    policy = get_freshness_policy(asset_key)
    if policy:
        age = time.time() - latest.created_at
        if age > policy.maximum_lag_seconds:
            return True
    
    # Check version-based freshness
    if consumed_upstream:
        for upstream_key, consumed_version in consumed_upstream.items():
            upstream_latest = await get_latest_materialization(upstream_key)
            if upstream_latest and upstream_latest.asset_version != consumed_version:
                return True  # Upstream has a newer version
    
    return False
```

### get_latest()
Retrieve the most recent materialization:

```python
materialization = await catalog.get_latest(AssetKey("cleaned_orders"))

if materialization:
    print(f"Produced at: {materialization.created_at}")
    print(f"By: {materialization.producing_event} v{materialization.producing_event_version}")
    print(f"Upstream: {materialization.upstream_versions}")
```

Returns `None` if the asset has never been materialized.

### get_lineage()
Trace the full upstream dependency graph:

```python
lineage = await catalog.get_lineage(AssetKey("validated_orders"))

# Returns:
# {
#     "asset": "validated_orders",
#     "produced_by": "ValidateOrdersEvent v2.1.0",
#     "upstream": [
#         {
#             "asset": "cleaned_orders",
#             "produced_by": "CleanOrdersEvent v1.3.0",
#             "upstream": [
#                 {
#                     "asset": "raw_orders",
#                     "produced_by": "FetchOrdersEvent v1.0.0",
#                     "upstream": []
#                 }
#             ]
#         }
#     ]
# }
```

The lineage graph is built from `upstream_versions` on each materialization. It's a recursive query through the asset catalog. An auditor can trace any data product back to its origin.

## Automatic Cache Hits via bypass()
The `@asset` decorator injects a `bypass()` method that checks the `AssetCatalog`:

```python
# Injected by @asset decorator
def bypass(self) -> Optional[Tuple[bool, Any]]:
    if not asset_catalog.is_stale(self.asset_key):
        materialization = asset_catalog.get_latest(self.asset_key)
        return True, materialization.result
    return None
```

If the asset is fresh, the event is skipped. The cached materialization is used. No computation occurs. The result is already persisted — the coordinator treats it as `CONCRETE` and doesn't re-persist.

This is how Volnux achieves self-healing pipelines: stale assets are rematerialized automatically, fresh assets are reused. The workflow runs every hour, but computation only happens when data actually changes.

## Upstream Version Tracking
When an asset event executes, the framework records which upstream assets were consumed and at what versions:

```python
# Framework tracks consumption automatically
async def _post_process(self):
    upstream_versions = {}
    for result in self.previous_result:
        if result.is_asset:
            upstream_versions[result.asset_key] = result.version
    
    materialization = AssetMaterialisation(
        asset_key=self.asset_key,
        upstream_versions=upstream_versions,
        ...
    )
    await materialization.save_async()
```

The event author doesn't track versions manually. The framework inspects `previous_result`, identifies which results are assets, and records their versions. Lineage is automatic.

## Staleness Propagation
Staleness propagates through the dependency graph automatically:

```d2
direction: right
A: raw_orders\n(v1.0.0)
B: cleaned_orders\n(v1.0.0)
C: validated_orders\n(v1.0.0)
A -> B -> C
```

If `raw_orders` is rematerialized at `v1.1.0`:
* `cleaned_orders` is now stale — it was produced from `raw_orders v1.0.0`, but `v1.1.0` exists.
* `validated_orders` is also stale — its upstream `cleaned_orders` is stale, AND it was produced from an old version.

A single upstream change cascades through the entire dependency graph. The next time `validated_orders` is requested, the framework detects staleness, backtracks to `raw_orders`, rematerializes everything bottom-up, then executes `validated_orders` with fresh data.

## Self-Healing Pipelines
The combination of freshness policies, upstream version tracking, and automatic cache hits creates self-healing pipelines:

```pointy
RawOrders -> CleanOrders -> ValidateOrders -> WriteToDatabase
```

All three events are `@asset`-decorated. The pipeline runs on a schedule.

**Normal execution (no data changes):**
* `WriteToDatabase` requests `ValidateOrders`.
* `ValidateOrders.bypass()` checks catalog — fresh. Returns cached. Skipped.
* `CleanOrders.bypass()` checks catalog — fresh. Returns cached. Skipped.
* `RawOrders.bypass()` checks catalog — fresh. Returns cached. Skipped.
* Pipeline completes in milliseconds. No events executed. All cache hits.

**Execution after upstream change:**
* `WriteToDatabase` requests `ValidateOrders`.
* `ValidateOrders.bypass()` checks catalog — stale (upstream `CleanOrders` has newer version available because `RawOrders` changed).
* `ValidateOrders` executes — but first, its upstream `CleanOrders` must be fresh.
* `CleanOrders.bypass()` checks catalog — stale (`RawOrders` has newer version).
* `CleanOrders` executes — but first, `RawOrders` must be fresh.
* `RawOrders.bypass()` checks catalog — stale (freshness policy exceeded).
* `RawOrders` executes. Produces new materialisation v1.1.0.
* `CleanOrders` executes. Consumes `RawOrders` v1.1.0. Produces new materialisation v1.1.0.
* `ValidateOrders` executes. Consumes `CleanOrders` v1.1.0. Produces new materialisation v1.1.0.
* `WriteToDatabase` executes with fresh data.

Only the events that need to run actually run. The framework handles the dependency resolution, the backtracking, and the rematerialisation order. The event author writes a linear pipeline. The framework makes it self-healing.

## Assets and Normal Events
Assets and normal events can be mixed in the same pipeline:

```d2
direction: right
RO: RawOrders\nasset { shape: oval }
CO: CleanOrders\nasset { shape: oval }
LP: LogProgress\nnormal
VO: ValidateOrders\nasset { shape: oval }
WTD: WriteToDatabase\nnormal
RO -> CO -> LP -> VO -> WTD
```

`LogProgress` is a normal event. It doesn't produce an asset. It's invisible to the `AssetCatalog`. The freshness chain skips over it: `ValidateOrders` checks `CleanOrders` directly, not `LogProgress`. Normal events are transparent pass-throughs in the asset lineage graph.

When backtracking occurs:
If `ValidateOrders` detects `CleanOrders` is stale, backtracking runs `CleanOrders` again. `LogProgress` also runs again — it's a normal event between two assets, and the data flowing through it has changed. It re-executes with the fresh data. The framework doesn't skip normal events during backtracking because their output depends on their input, which has changed.
