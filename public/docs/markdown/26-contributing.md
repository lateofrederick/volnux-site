Volnux is an open-source project (Apache 2.0) that welcomes contributions. This section covers the architecture, development setup, and contribution process for new contributors.

## Architecture Overview for Contributors
Before contributing code, read the Architecture Deep Dive to understand the design philosophy. Here's the high-level structure of the codebase:

```text
volnux/
├── engine/                    # Workflow execution engine
│   ├── workflows.py           # WorkflowConfig base class
│   └── engine.py             # DefaultWorkflowEngine (queue-based BFS)
│
├── execution/                 # Event lifecycle and context
│   ├── context.py             # ExecutionContext (linked list + tree)
│   ├── state_manager.py       # ExecutionState, ExecutionStatus
│   └── base.py                # EventBase, lifecycle phases
│
├── parser/                    # Pointy-Lang compiler
│   ├── lexer.py               # Tokenizer
│   ├── parser.py              # Grammar parser
│   ├── compiler.py            # Graph compiler
│   └── operator.py            # PipeType, operators
│
├── triggers/                  # Trigger system
│   ├── base.py                # TriggerBase
│   ├── engine.py              # TriggerEngine (coroutine)
│   ├── schedule.py            # ScheduleTrigger
│   ├── event.py               # EventTrigger
│   ├── conditional.py         # ConditionalTrigger
│   ├── webhook.py             # WebhookTrigger
│   ├── windowed.py            # WindowedTrigger
│   └── rehydration.py         # RehydrationManager
│
├── distribution/              # Remote execution
│   ├── executors/
│   │   ├── grpc.py            # GRPCExecutor
│   │   ├── xmlrpc.py          # XMLRPCExecutor
│   │   └── tcp.py             # TCPExecutor
│   └── managers/
│       ├── grpc_manager.py    # GRPCRemoteManager
│       ├── xmlrpc_manager.py  # XMLRPCRemoteManager
│       └── tcp_manager.py     # TCPRemoteManager
│
├── persistence/               # Data layer
│   ├── backends/
│   │   ├── base.py            # KeyValueStoreBackendBase (ABC)
│   │   ├── postgres.py        # PostgresStoreBackend
│   │   ├── sqlite.py          # SqliteStoreBackend
│   │   └── redis.py           # RedisStoreBackend
│   ├── formax_fk.py           # ForeignKeyField, FKConfig
│   └── saga.py                # Saga (cross-backend transactions)
│
├── checkpointing/             # State management
│   ├── manager.py             # CheckpointManager
│   ├── snapshot.py            # EventCheckpointSnapshot
│   ├── resource.py            # ResourceProvider, ResourceMonitor
│   └── health.py              # HealthMonitor
│
├── result/                    # Result layer
│   ├── stream.py              # ResultStream, Q objects
│   ├── result.py              # EventResult
│   └── engine.py              # Dual-Backend Stream Engine
│
├── assets/                    # Asset system
│   ├── decorator.py           # @asset decorator
│   ├── catalog.py             # AssetCatalog
│   └── models.py              # AssetMaterialisation
│
├── agents/                    # Agentic AI
│   ├── base.py                # AgentEventBase
│   ├── loop.py                # ReAct loop
│   ├── tools.py               # Tool execution
│   └── providers/             # LLM adapters
│       ├── openai.py
│       ├── anthropic.py
│       ├── gemini.py
│       └── ollama.py
│
├── governance/                # Governance models
│   ├── models/
│   │   ├── workflow.py        # Workflow, WorkflowVersion
│   │   ├── audit.py           # AuditEntry
│   │   ├── approval.py        # ApprovalChain, ApprovalStep
│   │   ├── delegation.py      # Delegation, DelegationAction
│   │   ├── break_glass.py     # BreakGlassAccess, BreakGlassAction
│   │   └── iam.py             # User, Team, Role, Organization
│   └── manifest.py            # Manifest validation
│
├── cli/                       # Command-line interface
│   ├── base.py                # SubCommand, BaseCommand
│   ├── commands/
│   │   ├── project.py         # init, validate, build, manifest
│   │   └── runtime.py         # triggers, workflow, mesh, audit
│   └── framework/
│       ├── mixins.py          # OutputMixin, ProjectMixin, etc.
│       └── registry.py        # Command registry
│
├── api/                       # REST API (FastAPI)
│   ├── routes/
│   │   ├── auth.py
│   │   ├── triggers.py
│   │   ├── workflows.py
│   │   ├── mesh.py
│   │   └── audit.py
│   └── middleware.py
│
├── observability/             # OTel, metrics, signals
│   ├── tracing.py             # Span creation, context propagation
│   ├── signals.py             # Soft signals
│   └── metrics.py             # Prometheus metrics
│
└── decorators.py              # @event decorator, @asset
```

Key principles for contributors:

* **Async all the way down**. Everything that waits is a coroutine. Use `async`/`await` for I/O. Use `asyncio.to_thread()` for blocking calls. Never block the event loop.
* **Static over dynamic**. Precompute at class definition time. Avoid runtime introspection. Follow the formax-py pattern.
* **Separation of concerns**. Events process business logic. The coordinator handles persistence, routing, and observability. Don't mix them.
* **Explicit over implicit**. Nothing should happen by magic. Every dependency, trigger, and source must be explicitly declared.

## Setting Up Development Environment

### Prerequisites
* Python 3.11+
* Git
* PostgreSQL (for testing governance models)
* Redis (for testing checkpoints and HITL)
* A virtual environment tool

### Clone and Install
```bash
git clone https://github.com/volnux/volnux.git
cd volnux

python -m venv venv
source venv/bin/activate  # Linux/macOS
# venv\Scripts\activate   # Windows

# Install in development mode with all dependencies
pip install -e ".[dev,test,all]"
```

### Run Tests
```bash
# Run all tests
pytest

# Run specific test file
pytest tests/test_engine.py

# Run with coverage
pytest --cov=volnux --cov-report=html

# Run performance benchmarks
pytest tests/benchmarks/ --benchmark-only
```

### Run a Development Server
```bash
# Create a test project
volnux init test_project
cd test_project

# Start dev server with hot reload
volnux dev --host localhost --port 8080
```

### Set Up Pre-Commit Hooks
```bash
pre-commit install
pre-commit run --all-files
```

This runs:
* **Black** (code formatting)
* **isort** (import sorting)
* **flake8** (linting)
* **mypy** (type checking)
* **bandit** (security scanning)

## Code Style and Conventions

### Python Style
* **Formatting**: Black with default settings (line length 88).
* **Imports**: isort with Black profile. Standard library first, then third-party, then Volnux internal.
* **Type hints**: All public methods must have type hints. Use `typing` module for generics. Use `|` syntax for unions (Python 3.11+).
* **Docstrings**: Google-style docstrings. Every public class and method must have a docstring.

```python
async def execute_workflow(
    self,
    workflow_name: str,
    params: dict[str, Any],
    timeout: float | None = None,
) -> WorkflowResult:
    """
    Execute a workflow by name.

    Args:
        workflow_name: Name of the workflow to execute.
        params: Parameters passed to the workflow pipeline.
        timeout: Maximum execution time in seconds. None for no limit.

    Returns:
        WorkflowResult with execution status and output.

    Raises:
        WorkflowExecutionError: If the workflow fails or times out.
        WorkflowNotFoundError: If the workflow name is not registered.
    """
```

### Naming Conventions
* **Classes**: PascalCase (`WorkflowEngine`, `EventBase`)
* **Functions/Methods**: snake_case (`execute_workflow`, `get_result`)
* **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`, `DEFAULT_TIMEOUT`)
* **Private methods**: Prefix with underscore (`_build_context`, `_resolve_next_task`)
* **Framework-internal hooks**: Prefix with underscore (`_pre_process`, `_post_process`)
* **User-facing hooks**: No underscore (`bypass`, `after_process`, `communicate`)

### Async Patterns
```python
# Correct: await the async operation
result = await async_function()

# Correct: run sync function in thread pool
result = await asyncio.to_thread(sync_function, arg1, arg2)

# Wrong: blocking the event loop
result = sync_function(arg1, arg2)  # Blocks all coroutines

# Wrong: not awaiting a coroutine
result = async_function()  # Returns coroutine, doesn't execute
```

### Error Handling
* Use specific exception types. Never catch bare `Exception` unless re-raising.
* Framework errors inherit from `VolnuxError`.
* User-facing errors have clear, actionable messages. Include the fix in the error message when possible.
* Log with appropriate levels: `DEBUG` for flow, `INFO` for milestones, `WARNING` for recoverable issues, `ERROR` for failures.

## Testing

### Test Categories
**Unit tests**: Test individual functions and classes in isolation. Mock external dependencies.

```python
# tests/test_event_base.py
async def test_process_returns_result():
    event = TestEvent()
    event._call_args = {}
    event._call_kwargs = {}
    
    success, result = await event._execute_process_phase()
    
    assert success is True
    assert result == "expected_output"
```

**Integration tests**: Test interactions between components with real backends.

```python
# tests/test_checkpoint_manager.py
async def test_checkpoint_persist_and_restore(redis_backend):
    manager = CheckpointManager(backend=redis_backend)
    await manager.start()
    
    snapshot = EventCheckpointSnapshot(
        task_id="test-1",
        class_path="tests.TestEvent",
        phase=EventPhase.PROCESSING,
    )
    await manager.enqueue(snapshot)
    await manager.drain()
    
    restored = await manager.load("test-1")
    assert restored.task_id == "test-1"
```

**Performance benchmarks**: Ensure critical paths meet performance targets.

```python
# tests/benchmarks/test_model_init.py
def test_formax_init_speed(benchmark):
    def create_model():
        return User(id=1, name="Alice", email="alice@example.com")
    
    result = benchmark(create_model)
    assert result.id == 1
```

### Test Fixtures
Use `conftest.py` for shared fixtures:

```python
# tests/conftest.py
@pytest.fixture
async def pg_backend():
    backend = PostgresStoreBackend(
        host="localhost",
        database="volnux_test",
        username="test",
        password="test",
    )
    yield backend
    # Cleanup test data
    await backend.clear_schema("volnux_test_workflow")
```

### Running CI Locally
```bash
# Run the full CI pipeline
make ci

# Individual steps
make lint        # Black, isort, flake8
make typecheck   # mypy
make test        # pytest
make security    # bandit
make docs        # Build documentation
```

## Documentation Contributions
Documentation is built with MkDocs Material. Source files are in `docs/`.

### Build Documentation Locally
```bash
pip install -e ".[docs]"
mkdocs serve
```
Open http://localhost:8000 to see the documentation.

### Documentation Style
* **Tutorials**: Step-by-step instructions. Assume the reader is new to Volnux.
* **How-to guides**: Practical solutions to specific problems. Assume the reader knows the basics.
* **Reference**: Precise, complete API documentation. Generated from docstrings.
* **Explanation**: Architecture deep dives, design decisions, background context.

### Adding New Documentation
* Create a new Markdown file in the appropriate `docs/` subdirectory.
* Add the page to `mkdocs.yml` navigation.
* If documenting a new feature, include:
  * What it does (one sentence)
  * When to use it
  * A minimal working example
  * Common pitfalls
  * Links to related features

## RFC Process
Significant changes to Volnux's architecture or public API go through the RFC (Request for Comments) process.

### When to Write an RFC
* Adding a new core component (new executor type, new persistence backend)
* Changing the event lifecycle or public API
* Modifying Pointy-Lang syntax or semantics
* Changing governance model schemas
* Adding new protocol support for remote execution

### RFC Format
* **Summary**: One paragraph explaining the change.
* **Motivation**: Why is this needed? What problem does it solve?
* **Design**: Detailed technical design. Include code examples.
* **Tradeoffs**: What are the downsides? What alternatives were considered?
* **Migration Path**: How do existing users adopt this change?
* **Implementation Plan**: Steps, milestones, estimated effort.

### RFC Process
1. Fork the repository and create a branch.
2. Copy `rfcs/0000-template.md` to `rfcs/XXXX-your-title.md`.
3. Fill in the RFC. Be thorough. Include examples.
4. Submit a pull request with the `rfc` label.
5. The community discusses the RFC in the pull request comments.
6. Core maintainers make the final decision.
7. If accepted, the RFC is merged. Implementation follows.
8. If rejected, the RFC is closed with an explanation.

### Ongoing RFCs
Check the `RFCs` directory for active discussions.

## Community
* **GitHub**: github.com/volnux/volnux
* **Discord**: discord.gg/volnux
* **EventHub**: eventhub.volnux.dev
* **Documentation**: docs.volnux.dev

## License
Volnux is licensed under the Apache License 2.0. All contributions are made under the same license. By submitting a pull request, you agree to license your contribution under Apache 2.0.
