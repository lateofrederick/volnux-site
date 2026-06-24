This glossary defines terms used throughout the Volnux documentation. Where a term has a specific meaning in Volnux that differs from general usage, that meaning is noted.

## A
**Action (Saga)**: A callable that performs one step of a distributed transaction. Must be idempotent — the Saga may retry it.

**Action (Agent)**: A decision made by an AI agent during its ReAct loop: `TOOL_CALL`, `HANDOFF`, `FINISH`, `THINK`, `PAUSE`, or `ERROR`.

**Activation**: The moment a trigger fires and dispatches a workflow for execution. A `ScheduleTrigger` activates on its cron schedule. An `EventTrigger` activates when a matching event arrives.

**Active Monitor**: The `CheckpointManager` component that periodically snapshots registered objects (`ExecutionContext`, resources) without being asked. Contrast with the passive queue, which is event-driven.

**Adapter**: A pluggable component that implements a specific protocol or interface. Backend adapters implement `KeyValueStoreBackendBase`. LLM provider adapters implement `LLMProviderAdapter`. Human interface adapters implement HITL notification channels.

**AgentEventBase**: The base class for AI agents in Volnux. Extends `EventBase` with a ReAct reasoning loop, governed tools, handoff management, prompt versioning, and token tracking.

**Aggregator**: A named event source within a `WindowedTrigger`. Each aggregator feeds events into its named slot in the window state. Multiple aggregators can feed the same window.

**Annotation**: Square bracket syntax in Pointy-Lang: `Event[key=value]`. Passes configuration parameters to events. The executor annotation declares which executor to use.

**Asset**: A governed, versioned, lineage-tracked data product produced by an event. Declared with the `@asset` decorator. Tracked in the `AssetCatalog`.

**AssetCatalog**: The queryable system of record for asset metadata. Backed by PostgreSQL. Provides `is_stale()`, `get_latest()`, and `get_lineage()`.

**AssetKey**: A globally unique identifier for an asset. Follows the convention `group.asset_name` or `asset_name`.

**AssetMaterialisation**: A formax model recording that an asset was produced. Includes the asset key, version, producing event, upstream versions consumed, and metadata.

**AssetTrigger**: A trigger that fires when an asset is materialized or becomes stale.

**AsyncTaskWorkflowExecutor**: The default workflow executor for development. Runs workflows as asyncio Tasks in the same event loop.

**AuditEntry**: An append-only governance model recording every significant action in Volnux. Stored in PostgreSQL. Immutable once written.

**Auto-discovery**: The mechanism by which the CLI discovers workflows by scanning the `workflows/` directory. Convention over configuration. Folder names become workflow names.

## B
**Backpressure**: The mechanism that slows upstream producers when downstream consumers can't keep up. In Volnux, backpressure flows through `ResultStream` buffers, `asyncio.Queue` capacity, and async/await chains. Automatic — no explicit coordination needed.

**BatchPipeline**: A `Pipeline` subclass that runs a workflow multiple times with different parameter sets. The `generate_params()` method returns parameter dicts. Each execution is independent.

**Bridge Node**: A node in the P2P mesh global layer. Forms a 3-node Raft cluster. Maintains the inter-network routing table. In the resolution path, never in the data path.

**BreakGlassAccess**: A governance model defining who can invoke emergency access and under what conditions.

**BreakGlassAction**: A governance model recording every invocation of emergency access — who, what, when, why.

**Bypass**: The hook (`bypass()`) that allows an event to be skipped. Returns `(True, result)` to skip with a cached result, `None` to execute normally. The `@asset` decorator injects a bypass that checks the `AssetCatalog`.

## C
**CeleryWorkflowExecutor**: A workflow executor that dispatches entire workflow executions to Celery workers. Each execution is a Celery task.

**CFG Mode**: Control-flow graph execution mode. Allows events to be revisited in different contexts. Enables agent loops, retry scopes, and multi-agent handoffs.

**ChainedTrigger**: A trigger that composes multiple triggers sequentially. Each step must fire before the next starts. The workflow fires when all steps complete.

**Checkpoint**: A snapshot of an event's complete state — phase, variables, resources, retry count. Stored in Redis. Enables resumption from the exact point of interruption.

**CheckpointManager**: The coroutine that manages checkpoint persistence. Operates in two modes: passive queue (events push snapshots) and active monitor (periodically snapshots registered objects).

**Command Channel**: The bidirectional communication channel between operators and running events. Supports `PAUSE`, `RESUME`, `CANCEL`, `CHECKPOINT`, and `UPDATE_PRIORITY` commands.

**Communicate**: The lifecycle phase (`communicate()`) that runs before `process()`. Handles external communication: HITL requests, external event waits, condition polling. Can suspend the event, releasing all resources.

**Compensation**: A callable that undoes a Saga step. Runs in reverse order when a Saga step fails. Must be idempotent.

**Concrete (ResultPersistence)**: A result persistence strategy indicating the result is already persisted (e.g., a materialization from the AssetCatalog). The coordinator skips persistence.

**Conditional Branching**: Parenthesis syntax in Pointy-Lang: `Event (0 -> BranchA, 1 -> BranchB)`. Routes execution based on the event's result or explicit `goto()` calls.

**ConditionalTrigger**: A trigger that polls a `condition_fn` and fires on True. `edge_trigger=True` fires only on False→True transitions.

**Cooperative Concurrency**: Execution model using coroutines or threads that voluntarily yield control. Used for I/O-bound work. Represented by `{}` in Pointy-Lang. Contrast with true parallelism (`\|\|`).

**Coroutine**: An async function that can suspend and resume. Volnux uses coroutines for all waiting-bound components: triggers, engine, checkpoint manager, health monitor.

## D
**DAG Mode**: Directed acyclic graph execution mode. Events cannot be revisited. The simplest execution mode. Matches Airflow's and Dagster's model.

**Deferred Task**: An event that is not defined locally. Referenced by name in Pointy-Lang with a remote executor annotation. The actual event class exists on another node.

**Delegation**: A governance model defining temporary authority transfer. Records who delegated to whom, for what scope, and for how long.

**DelegationAction**: A governance model recording every time delegated authority was exercised.

**Dirty Flag**: A boolean on `TriggerStateRecord` indicating the CLI wrote a change the engine hasn't applied yet. The engine polls and reconciles. Enables CLI control across process boundaries.

**Dual-Backend Stream Engine**: The result storage layer with two simultaneous backends: in-memory (fast, ephemeral) and persistent (Redis/PostgreSQL, durable). The event's `persist_result` setting determines which backend is used.

**Durable (ResultPersistence)**: A result persistence strategy indicating the result should be written to the persistent backend. Survives process restarts.

## E
**EntryPointMixin**: A convenience mixin for CLI commands that bundles `OutputMixin`, `ProjectMixin`, and `TemplateMixin`.

**Event (Volnux)**: The smallest unit of governed execution. Not a passive task — a mini-orchestrator that manages its own lifecycle, resources, retries, and checkpointing.

**EventBus**: The internal publish/subscribe system that connects `EventTrigger` instances to event sources.

**EventCheckpointSnapshot**: A formax model storing an event's complete state for recovery. Persisted to Redis with upsert semantics (one per task ID).

**EventHub**: The package registry for Volnux. Stores event packages, workflow packages, and agent packages. Validates manifests. Resolves dependencies.

**EventPipeline**: The lightweight library version of Volnux. `pip install event-pipeline`. No scaffold, no CLI, no checkpointing. Single-file workflows with `@event` decorators.

**EventResult**: A single result in a `ResultStream`. Carries content, `task_id`, error, `is_persisted`, `is_asset`, and version.

**EventTrigger**: A trigger that subscribes to the event bus and fires when a matching event arrives.

**ExecutionContext**: The runtime structure organizing workflow execution. A doubly-linked list horizontally (previous/next event) and a tree vertically (parent/child for subgraphs). Carries task profiles, pipeline reference, and metrics.

**Executor**: Where an event runs. Options: `DefaultExecutor` (async), `ThreadPoolExecutor`, `ProcessPoolExecutor`, `RustExecutor`, `CythonExecutor`, `RemoteExecutor`. Declared per event class or per Pointy-Lang annotation.

## F
**Fail-Fast**: The principle that validation errors should be raised immediately at construction time, not deferred to access time. formax-py enforces this. All Volnux models inherit it.

**Flow Selector**: An ephemeral component that determines the next task(s) after a dispatch completes. Created for a single routing decision, then discarded.

**formax-py**: The high-performance Python model builder and validation engine underlying all Volnux governance models. 565ns init time. Supports configurable performance tiers.

**Fractal Execution Tree**: The hierarchical structure of `ExecutionContext` nodes. Self-similar at every scale: a workflow is a list of events; a subgraph is a list of events. The OTel trace mirrors this structure exactly.

**FreshnessPolicy**: A declaration on an `@asset`-decorated event specifying how often the asset should be rematerialized. `maximum_lag_minutes=60` means the asset is stale if older than 60 minutes.

## G
**GlobalPool Manager**: The component that manages executor pools. Enforces `W_max = floor(Q_max / R_w)` — only leaf events occupy process slots. Orchestrators never use processes.

**Governance Model**: A formax model that records governance-relevant data: `Workflow`, `AuditEntry`, `ApprovalChain`, `BreakGlassAccess`, `Delegation`, `AssetMaterialisation`. All persist to PostgreSQL.

**goto()**: A method on `EventBase` that overrides normal success/failure routing. Calls `self.goto(descriptor, success, result)` to direct execution to a specific conditional branch.

## H
**Handoff**: An agent action that transfers control to another agent. The target must be in the agent's `permitted_handoffs` list. Implemented via CFG mode's event reuse.

**HealthMonitor**: A coroutine that monitors infrastructure components (`CheckpointManager`, `RehydrationManager`) and restarts them on failure. Up to `max_restart_attempts` restarts.

**HITL (Human-in-the-Loop)**: The mechanism for integrating human decisions into workflows. The `communicate()` hook requests input and suspends the event. The human responds. The event resumes with the response.

**HITLQueue**: Redis-backed queue of pending human approval requests. Stores `HITLRequest` records with TTL.

**HITLSuspensionRequest**: A control flow exception raised when `request_human_input()` is called. Caught by the coordinator, which suspends the event and enqueues the HITL request.

## I
**InitStrategy**: A formax-py configuration controlling how model instances are constructed. `FAST` uses pre-compiled code generation (565ns). `DATACLASS` uses standard Python dataclass construction.

**INIT_PARAMS_SCHEMA**: A class attribute on `EventBase` declaring configurable parameters. Used by the Pointy-Lang annotation system and the EventHub manifest. Maps parameter names to types, defaults, and validators.

**InputDataField**: A field on a `Pipeline` subclass declaring a typed workflow input. Supports `data_type`, `required`, `default`, `description`, and `batch_size`.

**is_persisted**: A flag on `EventResult` indicating whether the result is in the persistent backend. Set by the coordinator based on the event's `persist_result` setting.

## K
**KeyValueStoreIntegrationMixin**: The persistence bridge between formax models and storage backends. Provides CRUD operations, Django-style lookups, Q objects, and `ResultStream` integration.

**KubernetesWorkflowExecutor**: A workflow executor that creates a Kubernetes Job per workflow execution. The Job runs in its own pod with resource limits.

## L
**Lazy Evaluation**: Results are not materialized until consumed. A `ResultStream` fetches records in chunks from the persistence backend. Memory is proportional to consumption, not production.

**Lazy Rehydrator**: The mechanism for resuming workflows. Fully loads the current event. Replaces neighboring events with `LazyContextProxy` placeholders that materialize on first access. O(1) resumption cost.

**Lifecycle (Event)**: The six phases every event passes through: `INITIALIZED`, `COMMUNICATING`, `PRE_PROCESS`, `PROCESSING`, `POST_PROCESS`, `COMPLETED`.

**Lifecycle (Trigger)**: The four states a trigger can be in: `STOPPED`, `ACTIVE`, `PAUSED`. Controlled via CLI or REST API.

**Lineage**: The dependency graph of assets. Tracked through `upstream_versions` on `AssetMaterialisation`. Queryable via `AssetCatalog.get_lineage()`.

## M
**Manager Trigger**: A trigger that listens for remote workflow dispatch requests on the P2P mesh. Hands dispatched workflows to the local engine for execution.

**Manifest**: The `volnux.manifest.json` file declaring a package's identity, contents, dependencies, compatibility, and deprecation timeline. Generated by the CLI. Validated against JSON Schema.

**ManualTrigger**: A trigger enabling CLI-initiated workflow execution. Implicit in development. Must be explicitly registered in production.

**Materialization**: A record that an asset was produced. The `AssetMaterialisation` model captures what was produced, by what code version, from what upstream assets, at what time.

**Merge Optimization**: The `CheckpointManager`'s optimization that collapses multiple snapshots for the same event into a single storage write. Only the latest snapshot survives.

**Meta Event**: A higher-order event that orchestrates other events: `MAP`, `REDUCE`, `FILTER`, `BROADCAST`. Takes an event class as a template and executes it multiple times. Always runs in async/thread (orchestrator).

**MetaFlow**: The execution orchestrator within a Meta Event. Manages concurrent execution of template events respecting `max_workers` and `concurrency_mode`.

**MiniAnnotated**: formax-py's version of `typing.Annotated`. Attaches metadata (`Attrib`) to a type for validation, formatting, and schema generation.

## N
**Namespace**: A logical grouping for events within an event package. The directory name becomes the namespace. Prevents name collisions between packages.

**NotImplementedError (bypass convention)**: The default `bypass()` implementation raises `NotImplementedError`. The framework catches this and executes the event normally. Distinguishes "not implemented" from "implemented but declined."

## O
**Orchestration**: Coordination work — traversing graphs, waiting for results, managing dependencies. I/O-bound by nature. Always runs in async/thread, never in processes.

**OrJSONModelFormatter**: Volnux's custom formax formatter using `orjson` for fast JSON serialization. Registered at startup. Used by all governance models transparently.

**OTel (OpenTelemetry)**: The observability backbone. Every event execution is a span. Every workflow is a trace. The fractal execution tree maps to the span hierarchy. Zero user instrumentation required.

## P
**Passive Queue**: The `CheckpointManager`'s event-driven checkpoint path. Events push snapshots to an `asyncio.Queue`. The manager drains and persists them.

**Pause Gate**: An `asyncio.Event` checked before each step in `process()`. When set (paused), the event blocks until cleared (resumed). Enables cooperative pausing at safe boundaries.

**Pipeline**: A class defining the typed inputs a workflow accepts. Fields are `InputDataField` instances. Validates `workflow_params` before execution.

**Pointy-Lang**: Volnux's declarative workflow DSL. Compiled to a static graph at parse time. Operators: `->`, `\|->`, `\|\|`, `{}`, `()`, `[]`, `*`, `??`.

**Post-Process**: The lifecycle phase (`_post_process()`) handling result routing and materialization recording. Framework-managed. No user hook.

**Pre-Process**: The lifecycle phase (`_pre_process()`) handling bypass checks. Calls `bypass()`. If bypass returns a result, raises `SkipExecutionError` to skip remaining phases.

**Previous Result**: The queryset API (`self.previous_result`) for accessing upstream event results. Supports `filter()`, `get()`, `first()`, `order_by()`, and Q objects. Django-style lookup syntax.

**ProcessWorkflowExecutor**: A workflow executor that spawns a child process per workflow execution. Supports timeout and memory limit enforcement.

**Prompt Version**: A version string on `AgentEventBase` tracking which system prompt was used. Stamped into every reasoning step and the EventHub manifest for auditability.

## Q
**Q Objects**: A query abstraction for complex boolean logic in `filter()`. Supports `&` (AND), `\|` (OR), `~` (NOT). Composable arbitrarily.

**Queryset**: The API for querying results and models. `previous_result` for event results. `filter_async()` for governance models. Consistent Django-style lookup syntax across both.

**Query Pushdown**: The mechanism by which `filter()` lookups are translated to native database queries (SQL `WHERE` clauses). Avoids materializing all records and filtering in Python.

## R
**ReAct Loop**: The Reasoning + Acting loop inside `AgentEventBase.process()`. The agent reasons, decides an action, executes it, observes the result, repeats. Checkpointed at every step boundary.

**Reconciliation Loop**: The `TriggerEngine`'s periodic check for dirty `TriggerStateRecord` entries. Applies CLI changes (pause, resume, stop) to actual trigger instances.

**RehydrationManager**: A trigger that wakes suspended events. Watches Redis channels for HITL responses, external events, and condition changes. Extends `TriggerBase` — inherits lifecycle, CLI visibility, OTel traces.

**RemoteExecutor**: An executor that dispatches an event to another node via gRPC, XML-RPC, or TCP. The event class exists on the remote node.

**RemoteManager**: A server that listens for incoming remote execution requests. Receives event name and parameters, executes the event locally, returns the result.

**ResourceProvider**: A protocol defining three class methods: `save_state(resource)`, `restore_state(data)`, `cleanup(resource)`. Implemented per resource type (file handles, DB connections, S3 clients).

**ResourceMonitor**: A coroutine that periodically captures the state of registered resources. Updates `_external_resources` in-place. Forces capture on checkpoint.

**ResultPersistence**: An enum controlling result storage: `TRANSIENT` (in-memory only), `DURABLE` (persist to backend), `CONCRETE` (already persisted).

**ResultStream**: A lazy, queryable, shardable sequence of `EventResult` objects. Supports `filter()`, `order_by()`, `take()`, `shard()`, `count()`. Backed by the dual-backend stream engine.

**RetryMixin**: A mixin on `EventBase` providing configurable retry with exponential backoff and exception-type scoping.

## S
**Saga**: A utility library coordinating cross-backend transactions. Executes steps in order. Compensates completed steps in reverse on failure. ~50 lines of Python.

**ScheduleTrigger**: A trigger that fires on a cron schedule. Uses Celery Beat for cron evaluation.

**Self-Healing Pipeline**: A pipeline where stale assets are automatically rematerialized. The `@asset` decorator's `bypass()` checks freshness. If stale, the event executes. If fresh, the cached materialization is used.

**Semaphore (Executor)**: An `asyncio.Semaphore` limiting concurrent workflow executions in `AsyncTaskWorkflowExecutor`. Provides backpressure when all slots are occupied.

**Shard**: A method on `ResultStream` that splits the stream into n independent sub-streams. Enables parallel consumption without head-of-line blocking.

**Shutdown Drain**: The `CheckpointManager`'s guarantee that all enqueued snapshots are persisted before process exit. Retries failed writes. Confirms persistence before shutdown proceeds.

**SkipExecutionError**: A control flow exception raised by `_pre_process` when `bypass()` returns a result. Caught by the step runner. Skips remaining lifecycle phases.

**Soft Signals**: Structured events emitted by the framework at significant lifecycle transitions. `task_suspended`, `task_rehydrated`, `stale_asset_detected`, `retry_exhausted`. Typed, queryable, alertable.

**Static Graph**: The compiled Pointy-Lang graph. Known completely at parse time — all events, all edges, all branches. Enables Canvas UI, parse-time validation, and compliance readability.

**Subgraph**: A `{}` block in Pointy-Lang. Creates a `SubgraphControlFlow` with its own sub-engine. Events inside run concurrently. Subgraphs can be nested.

**SubgraphControlFlow**: A `ControlFlowEvent` subclass that orchestrates `{}` subgraphs. Creates a lightweight sub-engine for its child events. Reports success/failure to the parent engine.

## T
**Template Event**: The event class passed to a Meta Event. `MAP<TradeValidator>` — `TradeValidator` is the template. The Meta Event creates N instances, one per batch.

**Transient (ResultPersistence)**: A result persistence strategy keeping results in-memory only. Lost on process restart. For intermediate results that don't need durability.

**Trigger**: A coroutine that waits for a condition and fires a workflow. Types: `ScheduleTrigger`, `EventTrigger`, `ConditionalTrigger`, `WebhookTrigger`, `WindowedTrigger`, `ChainedTrigger`, `ManualTrigger`, `AssetTrigger`.

**TriggerEngine**: The container for all active triggers. Manages their lifecycle. Reconciles dirty flag changes. Provides observability.

**TriggerStateRecord**: A formax model (SQLite-backed) tracking a trigger's runtime state: lifecycle, fire count, error count, dirty flag.

**Two-Level Dispatcher**: Volnux's dispatch architecture: Level 1 (Trigger → WorkflowExecutor) dispatches entire workflows. Level 2 (Workflow → EventExecutor) dispatches individual events. Different resource pools for each.

## U
**Upsert**: Atomic insert-or-update. `INSERT ... ON CONFLICT (id) DO UPDATE` in PostgreSQL and SQLite. Used by the `CheckpointManager` for checkpoint persistence.

**Upstream Versions**: A dict on `AssetMaterialisation` mapping upstream asset keys to the versions consumed. Enables version-based staleness detection.

## V
**ValidationFlags**: formax-py configuration controlling validation strictness: `NONE` (raw assignment), `TYPECHECK` (type only), `FULL` (all validators and constraints).

## W
**WebhookTrigger**: A trigger that exposes an HTTP endpoint. Fires a workflow on POST. Payloads verified with HMAC-SHA256.

**WindowedTrigger**: A trigger that accumulates events from multiple sources and fires when a `condition_fn` returns True or a `window_timeout` expires. Content-aware trigger conditions.

**WindowSink**: The condition evaluator within a `WindowedTrigger`. Contains the `condition_fn` that inspects `window_state` and decides when to fire.

**WorkflowConfig**: The class defining a workflow's identity, dependencies, and infrastructure. `name`, `version`, `mode`. The `ready()` hook registers triggers, sources, and executors.

**WorkflowEngine**: The queue-based BFS engine that traverses the Pointy-Lang graph. Creates `ExecutionContext` nodes. Dispatches events to their executors. Handles task switching and conditional branching.

**WorkflowExecutor**: The Level 1 dispatcher. Determines where an entire workflow runs. Options: `AsyncTaskWorkflowExecutor`, `ProcessWorkflowExecutor`, `CeleryWorkflowExecutor`, `KubernetesWorkflowExecutor`.

**WorkflowSource**: A declaration of where events come from. Points to an EventHub package, PyPI package, GitHub repository, or local directory. Registered in `ready()`.

## Y
**Yoyo Migrations**: A migration framework for versioned, reviewable database schema changes. Used by the PostgreSQL and SQLite adapters for production schema evolution. Contrast with dynamic migrations for development.
