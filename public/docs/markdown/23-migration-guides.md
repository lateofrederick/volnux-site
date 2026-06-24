Volnux provides migration paths from popular workflow orchestrators. Each guide covers conceptual mapping, code translation, and architectural differences. The goal is not a feature-for-feature port — it's to help you understand how your existing workflows translate to Volnux's governance-first model.

## From Airflow to Volnux
Airflow and Volnux share the concept of a DAG of tasks, but they differ fundamentally in execution philosophy. Airflow's scheduler is centralized; Volnux's triggers are decentralized. Airflow's tasks are stateless; Volnux's events are self-managing mini-orchestrators.

### Conceptual Mapping

| Airflow Concept | Volnux Equivalent |
| :--- | :--- |
| DAG | Pointy-Lang file (`.pty`) |
| Operator | `EventBase` subclass or `@event` function |
| Sensor | `ConditionalTrigger` or `communicate()` hook |
| XCom | `previous_result` queryset |
| `dag.schedule_interval` | `ScheduleTrigger` in `ready()` |
| `PythonOperator` | `@event` decorator |
| `BranchPythonOperator` | Conditional branching `()` in Pointy-Lang |
| `SubDagOperator` | `{}` subgraph |
| `TaskGroup` | `{}` concurrency group |
| Airflow Variables | Pipeline `InputDataField` or `WorkflowVariable` |
| Airflow Connections | `acquire_resource()` with `ResourceProvider` |

### Example Migration: ETL Pipeline

**Airflow:**
```python
from airflow import DAG
from airflow.operators.python import PythonOperator
from datetime import datetime

default_args = {'owner': 'data-team', 'retries': 3}

with DAG(
    'etl_pipeline',
    default_args=default_args,
    schedule_interval='0 6 * * MON-FRI',
    start_date=datetime(2024, 1, 1),
) as dag:

    def extract(**context):
        data = fetch_from_api()
        context['ti'].xcom_push(key='raw_data', value=data)

    def transform(**context):
        raw = context['ti'].xcom_pull(key='raw_data')
        cleaned = [r for r in raw if r is not None]
        context['ti'].xcom_push(key='cleaned_data', value=cleaned)

    def load(**context):
        cleaned = context['ti'].xcom_pull(key='cleaned_data')
        write_to_db(cleaned)

    extract_task = PythonOperator(task_id='extract', python_callable=extract)
    transform_task = PythonOperator(task_id='transform', python_callable=transform)
    load_task = PythonOperator(task_id='load', python_callable=load)

    extract_task >> transform_task >> load_task
```

**Volnux:**
```python
# events.py
from volnux import event

@event()
def extract(self):
    return True, fetch_from_api()

@event()
def transform(self):
    data = self.previous_result.first()
    cleaned = [r for r in data.content if r is not None]
    return True, cleaned

@event()
def load(self):
    data = self.previous_result.first()
    write_to_db(data.content)
    return True, "Data loaded"

# workflow.py
from volnux.engine.workflows import WorkflowConfig
from volnux.triggers import ScheduleTrigger

class ETLConfig(WorkflowConfig):
    name = 'etl_pipeline'
    version = '1.0.0'
    mode = 'DAG'

    def ready(self):
        self.register_trigger(ScheduleTrigger(
            cron="0 6 * * MON-FRI",
            timezone="UTC",
        ))

# etl_pipeline.pty
# Extract |-> Transform |-> Load
```

Key differences:
* **No XCom push/pull**. Results flow automatically through `previous_result`. No explicit key management.
* **No DAG context manager**. The workflow structure is in Pointy-Lang, not Python indentation.
* **Triggers are explicit**. The schedule is registered in `ready()`, not declared in `default_args`.
* **Retries are on the event**, not the DAG. Each event can have its own `RetryMixin` configuration.

### Airflow Sensors → Volnux Triggers

**Airflow:**
```python
from airflow.sensors.filesystem import FileSensor

wait_for_file = FileSensor(
    task_id='wait_for_file',
    filepath='/data/input.csv',
    poke_interval=30,
    timeout=3600,
)
```

**Volnux:**
```python
from volnux.triggers import ConditionalTrigger

def ready(self):
    self.register_trigger(ConditionalTrigger(
        workflow_name="process_file",
        condition_fn=lambda: os.path.exists('/data/input.csv'),
        edge_trigger=True,
        poll_interval=30.0,
    ))
```

Key difference: Airflow sensors hold worker slots while waiting. Volnux triggers are lightweight coroutines that consume near-zero resources.

## From Prefect to Volnux
Prefect and Volnux share the concept of decorated functions as execution units, but Volnux adds governance guarantees through static graph compilation and explicit resource management.

### Conceptual Mapping

| Prefect Concept | Volnux Equivalent |
| :--- | :--- |
| `@flow` | `WorkflowConfig` + Pointy-Lang file |
| `@task` | `@event` decorator |
| Prefect Future | `previous_result` queryset |
| Prefect Cloud Automations | `ScheduleTrigger`, `EventTrigger` |
| Prefect Work Pools | `WorkflowExecutor` (Celery, Kubernetes) |
| Prefect Artifacts | `EventResult` with `persist_result=DURABLE` |
| Prefect Blocks | `acquire_resource()` with `ResourceProvider` |

### Example Migration: Data Processing Flow

**Prefect:**
```python
from prefect import flow, task

@task(retries=3)
def fetch_data(url: str) -> list:
    return api.get(url)

@task
def process_data(data: list) -> list:
    return [item.upper() for item in data]

@task
def save_results(data: list) -> None:
    db.write(data)

@flow
def data_pipeline(url: str = "https://api.example.com/data"):
    raw = fetch_data(url)
    processed = process_data(raw)
    save_results(processed)
```

**Volnux:**
```python
# events.py
from volnux import event

@event()
def fetch_data(self):
    url = self.options.extras.get("url", "https://api.example.com/data")
    return True, api.get(url)

@event()
def process_data(self):
    data = self.previous_result.first()
    return True, [item.upper() for item in data.content]

@event()
def save_results(self):
    data = self.previous_result.first()
    db.write(data.content)
    return True, "Saved"

# pipeline.py
from volnux import Pipeline
from volnux.fields import InputDataField

class DataPipeline(Pipeline):
    url: str = InputDataField(
        default="https://api.example.com/data",
        description="API endpoint URL"
    )

# data_pipeline.pty
# FetchData |-> ProcessData |-> SaveResults
```

Key differences:
* **No imperative flow definition**. Prefect uses Python function calls to define dependencies. Volnux uses declarative Pointy-Lang. The static graph enables parse-time validation and compliance readability.
* **Typed inputs**. The `Pipeline` class declares typed parameters with defaults. Prefect infers types from function signatures.
* **Streaming by default**. `\|->` enables memory-bounded streaming between events. Prefect materializes intermediate results.

## From Dagster to Volnux
Dagster and Volnux share the concept of data-aware pipelines, but Volnux extends the model to streaming, HITL, and agentic AI while providing stronger governance guarantees.

### Conceptual Mapping

| Dagster Concept | Volnux Equivalent |
| :--- | :--- |
| `@asset` | `@asset` decorator |
| `AssetKey` | `AssetKey` |
| `FreshnessPolicy` | `FreshnessPolicy` |
| `AssetMaterialization` | `AssetMaterialisation` |
| `@op` | `@event` decorator or `EventBase` |
| `@graph` | Pointy-Lang `{}` subgraph |
| `@job` | `WorkflowConfig` |
| I/O Manager | ResultPersistence (`TRANSIENT`/`DURABLE`) |
| Dagster Daemon | `TriggerEngine` (decentralized) |
| Auto-materialization | `bypass()` hook + `AssetTrigger` |

### Example Migration: Asset Pipeline

**Dagster:**
```python
from dagster import asset, Definitions, AssetKey, FreshnessPolicy

@asset(
    key=AssetKey("raw_orders"),
    group_name="order_processing",
    freshness_policy=FreshnessPolicy(maximum_lag_minutes=30),
)
def raw_orders():
    return fetch_orders()

@asset(
    key=AssetKey("cleaned_orders"),
    deps=[raw_orders],
    freshness_policy=FreshnessPolicy(maximum_lag_minutes=60),
)
def cleaned_orders(raw_orders):
    return [o for o in raw_orders if o is not None]

defs = Definitions(assets=[raw_orders, cleaned_orders])
```

**Volnux:**
```python
from volnux.assets import asset, AssetKey, FreshnessPolicy

@asset(
    key=AssetKey("raw_orders"),
    group="order_processing",
    freshness_policy=FreshnessPolicy(maximum_lag_minutes=30),
)
class RawOrdersEvent(EventBase):
    async def process(self, **kwargs):
        return True, fetch_orders()

@asset(
    key=AssetKey("cleaned_orders"),
    group="order_processing",
    freshness_policy=FreshnessPolicy(maximum_lag_minutes=60),
)
class CleanedOrdersEvent(EventBase):
    async def process(self, **kwargs):
        raw = await self.previous_result.first()
        return True, [o for o in raw.content if o is not None]

# orders_pipeline.pty
# RawOrders |-> CleanedOrders
```

Key differences:
* **Assets are events**. Volnux assets inherit the full event lifecycle — checkpointing, command channel, HITL, executor dispatch. Dagster assets are functions.
* **Automatic cache hits**. The `@asset` decorator injects a `bypass()` method that checks the `AssetCatalog`. Fresh assets skip execution.
* **Decentralized scheduling**. Dagster's Daemon is centralized. Volnux's triggers are decentralized coroutines.
* **Streaming**. `\|->` enables memory-bounded streaming between assets. Dagster materializes intermediate results.

## From Temporal to Volnux
Temporal and Volnux both provide durable execution, but they differ fundamentally in their approach. Temporal uses deterministic replay. Volnux uses checkpoint-based resumption. Temporal requires external infrastructure. Volnux can run in-process.

### Conceptual Mapping

| Temporal Concept | Volnux Equivalent |
| :--- | :--- |
| Workflow | `WorkflowConfig` + Pointy-Lang |
| Activity | `EventBase` subclass or `@event` function |
| Child Workflow | `{}` subgraph or deferred task |
| Signal | Command channel (`PAUSE`, `RESUME`, `CANCEL`) |
| Query | `volnux workflow status` or REST API |
| Workflow History | `ExecutionContext` chain + OTel trace |
| Temporal Server | Not required (decentralized) |
| Worker | `WorkflowExecutor` (local, Celery, K8s) |
| `await workflow.sleep()` | `communicate()` with `wait_for_condition()` |

### Example Migration: Trade Processing

**Temporal:**
```python
@workflow.defn
class TradeProcessingWorkflow:
    @workflow.run
    async def run(self, trade_id: str):
        trade = await workflow.execute_activity(
            fetch_trade, trade_id,
            start_to_close_timeout=timedelta(minutes=5),
        )
        
        validated = await workflow.execute_activity(
            validate_trade, trade,
            start_to_close_timeout=timedelta(minutes=2),
        )
        
        if not validated:
            await workflow.execute_activity(
                notify_failure, trade_id,
                start_to_close_timeout=timedelta(minutes=1),
            )
            return
        
        await workflow.execute_activity(
            execute_trade, trade,
            start_to_close_timeout=timedelta(minutes=10),
        )
```

**Volnux:**
```python
# events.py
from volnux import event

@event()
async def fetch_trade(self):
    trade_id = self.options.extras["trade_id"]
    return True, await api.fetch(trade_id)

@event()
async def validate_trade(self):
    trade = self.previous_result.first()
    return True, validate(trade.content)

@event()
async def execute_trade(self):
    trade = self.previous_result.first()
    return True, await api.execute(trade.content)

@event()
async def notify_failure(self):
    trade = self.previous_result.first()
    await slack.notify(f"Trade validation failed: {trade.content}")
    return False, "Validation failed"

# trade_processing.pty
# FetchTrade -> ValidateTrade (
#     0 -> ExecuteTrade,
#     1 -> NotifyFailure
# )
```

Key differences:
* **No determinism requirement**. Temporal requires deterministic workflow code. Volnux uses snapshot-based checkpointing — call `datetime.now()` freely, use `random`, make API calls. The state is captured, not replayed.
* **No external server**. Temporal requires a Temporal Server (plus database). Volnux can run as a single process for development.
* **Conditional branching in the language**. Temporal uses Python `if` statements. Volnux uses Pointy-Lang `()` syntax. The static graph shows all branches before execution.
* **Sub-event checkpointing**. Temporal checkpoints at activity boundaries. Volnux checkpoints inside events at every step.

## From Apache Beam to Volnux
Beam and Volnux both handle streaming data, but Beam's windowing is pervasive while Volnux's is contained. Volnux adds governance, HITL, and agentic AI capabilities that Beam doesn't address.

### Conceptual Mapping

| Beam Concept | Volnux Equivalent |
| :--- | :--- |
| `PCollection` | `ResultStream` |
| `ParDo` | `MAP<Event>` |
| `GroupByKey` | `REDUCE<Event>` |
| `Combine` | `REDUCE<Event>` |
| `Flatten` | `BROADCAST<Event>` |
| `WindowInto` | `WindowedTrigger` |
| Runner (Dataflow, Flink, Spark) | `WorkflowExecutor` (local, Celery, K8s) |
| I/O Connectors | `@event` functions or `EventBase` subclasses |
| Pipeline | Pointy-Lang file |

### Example Migration: Streaming Word Count

**Beam:**
```python
with beam.Pipeline() as p:
    (p
     | "Read" >> beam.io.ReadFromPubSub(topic="input")
     | "Parse" >> beam.Map(lambda line: line.split())
     | "Flatten" >> beam.FlatMap(lambda words: words)
     | "Window" >> beam.WindowInto(beam.window.FixedWindows(60))
     | "Count" >> beam.combiners.Count.PerElement()
     | "Format" >> beam.Map(lambda kv: f"{kv[0]}: {kv[1]}")
     | "Write" >> beam.io.WriteToPubSub(topic="output"))
```

**Volnux:**
```python
# events.py
from volnux import event

@event()
def parse_lines(self):
    data = self.previous_result.first()
    return True, data.content.split()

@event()
def flatten_words(self):
    data = self.previous_result.first()
    return True, [w for line in data.content for w in line]

@event()
def format_output(self):
    data = self.previous_result.first()
    return True, [f"{word}: {count}" for word, count in data.content]

# In ready()
def ready(self):
    self.register_trigger(WindowedTrigger(
        workflow_name="word_count",
        aggregators=[
            EventTrigger(name="input", event_type="pubsub_message"),
        ],
        sink=WindowSink(
            condition_fn=lambda state: len(state.get("input", [])) >= 1000,
        ),
        window_timeout=60.0,
    ))

# word_count.pty
# ParseLines |-> FlattenWords |-> MAP<CountWord>[max_workers=4] |-> REDUCE<MergeCounts> |-> FormatOutput
```

Key differences:
* **Windowing is a trigger, not a transform**. Beam's `WindowInto` affects every downstream transform. Volnux's `WindowedTrigger` fires the workflow with the window contents. Inside the workflow, events are not window-aware.
* **No runner abstraction**. Beam pipelines behave differently on Dataflow vs Flink vs Spark. Volnux has one runtime.
* **Query pushdown replaces shuffle**. Beam's `GroupByKey` shuffles elements across workers. Volnux's `previous_result.filter()` pushes queries to the persistence backend.
* **Governance**. Beam has no audit trail, no versioning, no HITL, no command channel. Volnux provides all of these.

## From event-pipeline to Volnux
Migration from event-pipeline to Volnux is zero-cost. The same `@event` functions and `Pipeline` classes work in both. Volnux adds the project scaffold, CLI, checkpointing, triggers, and governance features.

### Migration Steps

1. Create a Volnux project:
```bash
volnux init my_project
cd my_project
```

2. Move your events:
Copy your `@event` functions from the event-pipeline script to `workflows/<name>/events.py`. No code changes needed.

3. Move your pipeline:
Copy your `Pipeline` class to `workflows/<name>/pipeline.py`. No code changes needed.

4. Create a Pointy-Lang file:
Move your inline Pointy-Lang string to `workflows/<name>/<name>.pty`:
```pointy
# Was: class Meta: pointy = "A -> B -> C"
# Now: A -> B -> C
```

5. Add a WorkflowConfig:
```python
# workflows/<name>/workflow.py
from volnux.engine.workflows import WorkflowConfig

class MyWorkflowConfig(WorkflowConfig):
    name = 'my_workflow'
    version = '1.0.0'
    mode = 'CFG'

    def ready(self):
        # Add triggers, sources, and executors here
        pass
```

6. Run with the CLI:
```bash
volnux workflow run my_workflow
```

What you gain:
* `volnux workflow run/validate/status` commands
* Trigger support (schedule, event, webhook, etc.)
* Checkpointing and crash recovery
* Command channel (pause, resume, cancel)
* HITL support
* Streaming with `\|->`
* Meta Events (`MAP`, `REDUCE`, `FILTER`, `BROADCAST`)
* Asset tracking with `@asset` decorator
* Audit trail and governance models
* EventHub publishing and consumption
* Multi-node deployment (Celery, Kubernetes)

Your events don't change. Your pipeline doesn't change. The foundation you built on event-pipeline is the same foundation Volnux extends.
