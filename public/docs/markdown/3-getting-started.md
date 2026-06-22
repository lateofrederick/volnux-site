## Your First Workflow (Single File)
The fastest way to get started requires no project scaffold, no CLI commands, and no configuration files. Just a single Python file.

Create a file called `hello_volnux.py`:

```python
from volnux.decorators import event
from volnux.pipeline import Pipeline

@event()
def greet(self):
    """Return a friendly greeting."""
    return True, "Hello, Volnux!"

@event()
def upper(self):
    """Convert the previous result to uppercase."""
    data = self.previous_result.first()
    return True, data.content.upper()

class HelloPipeline(Pipeline):
    class Meta:
        pointy = "greet -> upper"

# Run it
pipeline = HelloPipeline()
pipeline.start()
```

Run the file:

```bash
python hello_volnux.py
```

Output:

```text
Hello, Volnux!
HELLO, VOLNUX!
```

What just happened?

* `@event()` decorated two functions, turning them into governed execution units.
* `Pipeline` with inline Pointy-Lang (`"greet -> upper"`) defined the execution order.
* `pipeline.start()` executed the workflow — `greet` ran, its result flowed to `upper`, which transformed it.
* `self.previous_result.first()` retrieved the upstream event's output.

This single-file approach is perfect for learning, prototyping, and simple automation. It requires no CLI, no project structure, and no configuration. When you're ready for production features — triggers, checkpointing, audit trails — you'll move to the project scaffold.

## Project Scaffold (volnux init)
For production workflows, Volnux provides a structured project layout that enables auto-discovery, CLI management, and governance features.

Create a new project:

```bash
volnux init my_project
cd my_project
```

This generates:

```text
my_project/
├── config.py              # Project configuration (name, version)
├── init.py                # Engine initialization
├── workflows/             # Workflow definitions live here
│   └── __init__.py
├── commands/              # Custom CLI commands
│   └── __init__.py
├── logs/                  # Execution logs
├── tests/                 # Test directory
│   └── __init__.py
├── README.md
└── .gitignore
```

`config.py` contains project identity:

```python
from pathlib import Path

PROJECT_DIR = Path(__file__).parent
PROJECT_NAME = 'my_project'
VERSION = '0.1.0'
```

`init.py` bootstraps the engine:

```python
from pathlib import Path
from volnux.setup import initialise_workflows

project_dir = Path(__file__).parent
engine = initialise_workflows(project_dir)
```

The scaffold follows convention over configuration. The CLI discovers workflows by scanning the `workflows/` directory. Each subdirectory is a workflow. Each file within has a specific role. You'll see this in action next.

## Creating a Workflow (volnux workflow init)
Create your first scaffolded workflow:

```bash
volnux workflow init data_processing
```

This generates a workflow package under `workflows/data_processing/`:

```text
workflows/data_processing/
├── __init__.py
├── workflow.py            # WorkflowConfig subclass
├── pipeline.py            # Pipeline subclass (typed inputs)
├── events.py              # Event definitions
└── dataprocessing.pty     # Pointy-Lang source file
```

`workflow.py` — The workflow configuration:

```python
from volnux.engine.workflows import WorkflowConfig

class DataProcessingConfig(WorkflowConfig):
    name = 'data_processing'
    version = '2.0.0'
    mode = 'CFG'

    def ready(self):
        """
        Override this to register infrastructure resources.
        SHOULD DO:
        - Register registries
        - Set default configurations
        - Initialize connections
        - Load environment variables
        """
```

The `ready()` method is intentionally empty. This is where you'll later register triggers, event sources, and executors. For now, an empty `ready()` means the workflow runs with sensible defaults.

`pipeline.py` — Typed input schema:

```python
from volnux import Pipeline
from volnux.fields import InputDataField

class DataProcessing(Pipeline):
    pass  # No inputs required for this simple workflow
```

`events.py` — Your event definitions:

Replace the generated placeholder with real events:

```python
from volnux import event

@event(name="LoadData")
def load_data(self):
    data = {"items": ["apple", "banana", "orange"]}
    print("Loaded data:", data)
    return True, data

@event(name="ProcessData")
def process_data(self):
    data = self.previous_result.first()
    items = data.content.get("items", [])
    processed = [item.upper() for item in items]
    result = {"processed_items": processed}
    print("Processed data:", result)
    return True, result

@event(name="SaveData")
def save_data(self):
    data = self.previous_result.first()
    print("Saving data:", data.content)
    print("Workflow completed successfully.")
    return True, data
```

`dataprocessing.pty` — The Pointy-Lang workflow definition:

```pointy
LoadData |-> ProcessData |-> SaveData
```

This defines three events connected by streaming pipes. `LoadData` runs first. Its output streams to `ProcessData`. The processed output streams to `SaveData`. The `|->` operator enables memory-bounded streaming — downstream events can begin processing before upstream events complete.

## Running a Workflow (volnux workflow run)
Execute your workflow from the project root:

```bash
volnux workflow run data_processing
```

Output:

```text
Loaded data: {'items': ['apple', 'banana', 'orange']}
Processed data: {'processed_items': ['APPLE', 'BANANA', 'ORANGE']}
Saving data: {'processed_items': ['APPLE', 'BANANA', 'ORANGE']}
Workflow completed successfully.
```

What happened:

* The CLI discovered `data_processing` by scanning the `workflows/` directory.
* It loaded `DataProcessingConfig` from `workflow.py`.
* It compiled `dataprocessing.pty` into a static execution graph.
* It resolved `LoadData`, `ProcessData`, and `SaveData` from `events.py`.
* The engine executed the graph — each event ran in sequence, with results flowing through the pipeline.
* An implicit `ManualTrigger` fired the workflow for this single execution.

Running with parameters:

If your pipeline defines input fields, pass them via `--params`:

```bash
volnux workflow run data_processing --params '{"source": "s3://bucket/data.csv"}'
```

## Validating a Workflow (volnux workflow validate)
Before running, validate your workflow to catch errors early:

```bash
volnux workflow validate data_processing
```

The validator checks:

* **Pointy-Lang syntax** — Are there parse errors in the `.pty` file?
* **Event resolution** — Do all referenced events exist in `events.py` or registered sources?
* **Pipeline schema** — Do the pipeline inputs match what the workflow expects?
* **Graph structure** — Are there cycles or unreachable nodes?
* **Meta Event nesting** — Are Meta Events used correctly (no nested Meta Events)?

Successful validation:

```text
✓ Workflow 'data_processing' is valid.
  Mode: CFG
  Events: 3 (LoadData, ProcessData, SaveData)
  Graph: LoadData |-> ProcessData |-> SaveData
```

Failed validation:

```text
✗ Workflow 'data_processing' has errors:
  - Event 'SaveData' is not defined in events.py or registered sources.
  - Pointy-Lang syntax error at line 1: unexpected token '|->>'
```

Fix errors and validate again. Catch problems at your terminal, not in production.

## Development Server (volnux dev)
During development, use the built-in development server for rapid iteration:

```bash
volnux dev
```

This starts:

* A local Volnux engine with your workflows loaded
* A management REST API at `http://localhost:8080`

Edit `events.py`, save, and the server reloads automatically. Run your workflow:

```bash
volnux run data_processing
```

The development server uses the `AsyncTaskWorkflowExecutor` — all workflows run in-process as coroutines. No external infrastructure needed. When you're ready for production, switch to a production executor without changing your workflow code.

Stopping the management server: Press `Ctrl+C`. The server performs a clean shutdown — all running workflows complete their current event, checkpoints are drained to storage, and triggers are stopped gracefully.

Next step: Head to **Core Concepts** to understand events, pipelines, and the execution model in depth.
