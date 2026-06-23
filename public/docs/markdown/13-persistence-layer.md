Volnux's persistence layer is a multibackend ORM built on two foundations: `formax-py` for high-performance data modeling, and the `KeyValueStoreIntegrationMixin` for backend-agnostic storage operations. Together they enable a single model class to persist to PostgreSQL, SQLite, Redis, or any supported backend without code changes.

## formax-py — The Model Foundation
`formax-py` is a high-performance Python model builder and validation engine. It's the foundation beneath every governance model, checkpoint snapshot, and asset materialization in Volnux.

### BaseModel and MiniAnnotated
A formax model is a class with typed fields:

```python
from formax import BaseModel, MiniAnnotated, Attrib

class User(BaseModel):
    id: int
    name: str
    email: MiniAnnotated[str, Attrib(pattern=r"^\S+@\S+\.\S+$")]
    active: bool = True

user = User(id=1, name="Alice", email="alice@example.com")
```

`MiniAnnotated` attaches metadata to a type. `Attrib` carries validation rules, default values, and formatting hooks. The model is validated at construction time — fail-fast, not fail-at-access-time.

### Validation and Performance Tiers
`formax-py` provides configurable performance tiers:

```python
class User(BaseModel):
    id: int
    class Config:
        validation = ValidationFlags.TYPECHECK   # Type check only — fastest
        init_strategy = InitStrategy.FAST         # Pre-compiled code generation
```

| Validation Flag | What It Checks | Performance |
| :--- | :--- | :--- |
| **NONE** | Nothing — raw assignment | ~565ns init |
| **TYPECHECK** | Type correctness only | ~600ns init |
| **FULL** | All validators, constraints, patterns | ~800ns init |

The `InitStrategy.FAST` path generates optimized initialization code at class definition time — no runtime introspection, no dynamic dispatch. This is the Beazley pattern: dynamic at import time, static at runtime.

Benchmark:

| Library | Mean Init Time |
| :--- | :--- |
| **formax-py (fast mode)** | ~565ns |
| **dataclasses (CPython C)** | ~680ns |
| **Pydantic (Rust core)** | ~1.5µs |

`formax-py` beats the C-implemented standard library and the Rust-backed industry standard with pure Python. It achieves this by being static when it matters — pre-computed validators, pre-allocated slots, direct attribute assignment.

### Formatters and Serialisation
`formax-py` uses an adapter pattern for serialization. The formatter defines how a model is encoded and decoded:

```python
import orjson
from formax.formatters import DictModelFormatter

class OrJSONModelFormatter(DictModelFormatter):
    format_name = "orjson"
    
    def encode(self, _type, obj: str):
        return super().encode(_type, orjson.loads(obj))
        
    def decode(self, instance) -> str:
        data = orjson.dumps(super().decode(instance), default=str)
        return data.decode("utf-8")
```

Volnux registers `OrJSONModelFormatter` at startup. Every governance model serializes through `orjson` automatically — fast JSON parsing with native bytes handling. The models don't know about `orjson`. The formatter handles it.

Formatting hooks allow per-field pre- and post-processing:

```python
class Event(EventBase):
    timestamp: MiniAnnotated[
        float,
        Attrib(
            pre_formatter=lambda self, v: v.timestamp(),
            post_formatter=lambda self, v: datetime.fromtimestamp(v),
        ),
    ]
```

Timestamps are stored as floats in the database. They're `datetime` objects in Python. The formatter converts transparently. The adapter sees only floats. The event author works with datetimes.

### ForeignKeyField and FKConfig
`formax-py` supports foreign key relationships with configurable delete behavior:

```python
from volnux.backends.formax_fk import ForeignKeyField, FKConfig, OnDelete

class Workflow(GovernanceModel):
    name: str
    
    organization: ForeignKeyField[
        Organization,
        FKConfig(reverse_name="workflows", on_delete=OnDelete.CASCADE),
    ]
    created_by: ForeignKeyField[
        User,
        FKConfig(reverse_name="created_workflows", on_delete=OnDelete.PROTECT),
    ]
```

OnDelete rules:

| Rule | Database Behavior | Use Case |
| :--- | :--- | :--- |
| **CASCADE** | Delete child when parent deleted | Organization owns its workflows |
| **PROTECT** | Prevent parent deletion if children exist | Can't delete a user who created workflows |
| **SET_NULL** | Set field to NULL when parent deleted | Updated_by user leaves — field becomes null |
| **DO_NOTHING** | No database enforcement | Application-level handling |

The PostgreSQL adapter translates these to real `FOREIGN KEY ... ON DELETE` constraints. The SQLite adapter does the same. The governance is enforced at the database level, not just the application level.

## KeyValueStoreIntegrationMixin
The `KeyValueStoreIntegrationMixin` is the bridge between formax models and storage backends. It provides CRUD operations with Django-style lookups.

### CRUD Operations
```python
# Insert
await Workflow.insert_async(record_id="wf-1", name="trading", status="active")

# Get by ID
workflow = await Workflow.get_async(record_id="wf-1")

# Update
workflow.status = "paused"
await workflow.save_async()

# Delete
await Workflow.delete_async(record_id="wf-1")

# Upsert (atomic insert-or-update)
await Workflow.upsert_async(record_id="wf-1", name="trading", status="active")
```

Every operation is async. The mixin delegates to the configured backend adapter. The model class declares which backend to use.

### Django-Style Lookups
Filter records using field lookups identical to the `previous_result` queryset:

```python
# Exact match
workflows = await Workflow.filter_async(status="active")

# Comparison
old_workflows = await Workflow.filter_async(created_at__lt=yesterday)

# String matching
trading_workflows = await Workflow.filter_async(name__contains="trading")

# Membership
specific = await Workflow.filter_async(status__in=["active", "paused"])

# Complex queries with Q objects
from volnux.result.stream import Q

results = await Workflow.filter_async(
    Q(status="active") & (Q(name__contains="trade") | Q(name__contains="risk"))
)
```

The lookup syntax is identical whether querying PostgreSQL, SQLite, or Redis. The backend adapter translates lookups to native queries.

### Q Objects
`Q` objects enable complex boolean logic:

```python
# OR
Q(status="active") | Q(status="paused")

# AND
Q(status="active") & Q(name__contains="trade")

# NOT
~Q(status="archived")

# Composed
(Q(status="active") | Q(status="paused")) & ~Q(name__contains="test")
```

## Backend Adapters
Each backend adapter implements the `KeyValueStoreBackendBase` interface. Models are configured to use a specific adapter.

### PostgresStoreBackend
The PostgreSQL adapter is the primary backend for governance data.

Schema generation from type hints:

```python
class Workflow(GovernanceModel):
    name: MiniAnnotated[str, Attrib(min_length=1, max_length=255)]
    status: MiniAnnotated[WorkflowStatus, Attrib(default=WorkflowStatus.DRAFT)]
    version: MiniAnnotated[str, Attrib(default="0.1.0")]
```

The adapter reads type annotations and generates DDL:

```sql
CREATE TABLE volnux_Workflow (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'draft',
    version TEXT NOT NULL DEFAULT '0.1.0',
    _record_state JSONB NOT NULL
);

CREATE INDEX idx_volnux_Workflow_record_state ON volnux_Workflow USING GIN (_record_state);
```

Key features:
* **Typed columns**: `str` → `TEXT`, `int` → `BIGINT`, `bool` → `BOOLEAN`, `dict` → `JSONB`
* **Foreign key constraints**: `ForeignKeyField` with OnDelete rules become real SQL constraints
* **SQL pushdown**: `filter(name__contains="trade")` becomes `WHERE name LIKE '%trade%'`
* **JSONB fallback**: A `_record_state` column stores the complete serialized record for fidelity
* **GIN indexing**: The JSONB column is indexed for efficient JSON queries
* **Connection pooling**: Via `PostgresConnector` with configurable pool size
* **Native upsert**: `INSERT ... ON CONFLICT (id) DO UPDATE`

Foreign key example:

```sql
ALTER TABLE volnux_Workflow
ADD CONSTRAINT fk_volnux_Workflow_created_by_volnux_User
FOREIGN KEY (created_by_object_id)
REFERENCES volnux_User(id)
ON DELETE PROTECT;
```

Deleting a user who created workflows raises a database error. The governance is enforced by PostgreSQL.

### SqliteStoreBackend
The SQLite adapter is used for local, per-node state — trigger records, node heartbeats, local cache.

Key features:
* **Local file-based**: One SQLite database per Volnux node
* **FK dependency resolution**: Automatically creates dependent schemas in the correct order
* **Cycle detection**: Detects mutual FK dependencies and falls back to software enforcement
* **Case-insensitive search**: `LIKE ... COLLATE NOCASE` for `__icontains` lookups
* **Yoyo migrations**: Same migration framework as PostgreSQL

FK cycle detection:

```python
if target_schema in _creating:
    # Mutual dependency detected — omit FK, enforce in software
    logger.warning(f"Mutual FK dependency between '{schema_name}' and '{target_schema}'")
    continue
```

If Model A references Model B and Model B references Model A, the adapter detects the cycle, omits the back-reference FK constraint, and enforces referential integrity at the application level via `_on_delete_hook`.

### RedisStoreBackend
The Redis adapter is used for high-throughput, ephemeral state — checkpoints, HITL queues, result caches.

Key features:
* **Key-value operations**: `GET`, `SET`, `DEL` with key namespacing
* **TTL support**: Keys expire automatically — no manual cleanup needed
* **Atomic operations**: `SET nx=True` for distributed claims
* **Pub/sub**: HITL response channels, event bus subscriptions

Use cases:
* `EventCheckpointSnapshot` — fast in-memory checkpoint storage with TTL
* `HITLQueue` — pending human approval requests
* `ResultStream` cache — ephemeral in-memory results

## Schema Management (Yoyo Migrations)
Volnux uses a two-tier migration strategy:

**Dynamic migrations (development):**
When a model is first inserted, the adapter auto-creates the table from type hints. No migration files needed during development. Schema follows code.

**Yoyo migrations (production):**
For production deployments, migrations are versioned, reviewable SQL:

```python
# Yoyo migration file: 0001_add_workflow_table.py
from yoyo import step

steps = [
    step(
        """
        CREATE TABLE volnux_Workflow (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'draft'
        )
        """,
        "DROP TABLE volnux_Workflow"  # Rollback
    ),
]
```

Migrations are reviewed by DBAs. Applied in order. Rolled back if needed. The `YoyoMigrationsMixin` integrates this into the adapter.

## The Saga — Cross-Backend Transactions
When an operation spans multiple backends (e.g., write checkpoint to Redis AND record execution trace to PostgreSQL), the Saga library coordinates the transaction.

```python
saga = Saga()

saga.add_step(
    action=lambda: redis_backend.insert("checkpoints", key, record),
    compensation=lambda: redis_backend.delete("checkpoints", key),
)

saga.add_step(
    action=lambda: pg_backend.insert("volnux_ExecutionTrace", trace_id, trace),
    compensation=lambda: pg_backend.update("volnux_ExecutionTrace", trace_id, rolled_back),
)

try:
    await saga.execute()
except SagaError:
    # All compensations succeeded — system is consistent
    pass
except SagaCompensationError:
    # Some compensations failed — manual intervention may be needed
    pass
```

The Saga library is ~50 lines of Python. It executes steps in order. On failure, it compensates completed steps in reverse. It distinguishes between clean rollback (`SagaError`) and partial failure (`SagaCompensationError`). It doesn't retry — retry is the caller's concern. It doesn't handle timeouts — the callables wrap themselves. It does one thing: coordinate cross-backend operations with defined compensations.

## Governance Models
All governance models inherit from `GovernanceModel`, which inherits from both `KeyValueStoreIntegrationMixin` and `BaseModel` (`formax`). They persist to PostgreSQL by default.

Core governance models:

| Model | Purpose | Backend |
| :--- | :--- | :--- |
| Workflow | Workflow definitions and versions | PostgreSQL |
| User, Team, Role, Organization | Identity and access management | PostgreSQL |
| AuditEntry | Append-only audit trail | PostgreSQL |
| ApprovalChain, ApprovalStep | Multi-step human approval | PostgreSQL |
| BreakGlassAccess, BreakGlassAction | Emergency access records | PostgreSQL |
| Delegation, DelegationAction | Authority transfer records | PostgreSQL |
| AssetMaterialisation | Data lineage and freshness | PostgreSQL |
| Execution, ExecutionTrace | Workflow execution history | PostgreSQL |
| HITLRequest | Human-in-the-loop requests | PostgreSQL |
| TriggerConfig | Trigger definitions | PostgreSQL |
| TriggerStateRecord | Trigger runtime state | SQLite (per-node) |
| EventCheckpointSnapshot | Event recovery state | Redis |
| MeshNode, NodeHeartbeat | P2P mesh topology | PostgreSQL |

Why the split:
* **PostgreSQL**: Governance data that must survive node failures, support complex queries, and enforce referential integrity. FK constraints matter here.
* **SQLite**: Local, per-node state that doesn't need to be shared. Zero network latency. The dirty flag pattern works within a single node.
* **Redis**: High-throughput, ephemeral state. Checkpoints are written frequently and need TTL-based cleanup. HITL queues need pub/sub.

The model API is identical regardless of backend. `Workflow.get_async()` works the same whether the data is in PostgreSQL or (for testing) SQLite. The backend is configured per model class, not per operation.
