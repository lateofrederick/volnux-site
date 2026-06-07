This guide will help you bootstrap a Volnux project and start defining your events and pipelines.

### Prerequisites

Before starting, make sure you have:

- Python installed.
- Access to a terminal.
- A Python environment where packages can be installed.
- Basic familiarity with Python projects and modules.

### Install Volnux

Install Volnux using `pip`:

```bash
pip install volnux
```

After installation, confirm that the Volnux CLI is available:

```bash
volnux --version
```

You can also run the command without arguments to view the available CLI commands:

```bash
volnux
```

### Create a New Volnux Project

To create a new project, use the volnux init command:

```bash
volnux init my_project
```

This creates a new directory named `my_project` with the default Volnux project structure.

```text
my_project/
├── config.py
├── init.py
├── README.md
├── .gitignore
├── workflows/
│   └── __init__.py
├── commands/
│   └── __init__.py
├── logs/
└── tests/
    └── __init__.py
```

Move into the project directory:

```bash
cd my_project
```

### Create Your First Workflow

From inside the project directory, create a workflow:

```bash
volnux workflow init data_processing
```

This creates a workflow named `data_processing` under the `workflows/` directory.

```text
workflows/data_processing/
├── __init__.py
├── workflow.py
├── pipeline.py
├── events.py
└── dataprocessing.pty
```

The generated workflow gives you a starting point for defining how your tasks should run.

### Define the Workflow Logic

At this point, Volnux has created the workflow files for you. Now update the generated files so the workflow has real events, a pipeline, a workflow configuration, and a Pointy-Lang definition.

For this quickstart, the workflow will perform three simple steps:

1. Load some data.
2. Process the data.
3. Save the result.

The task flow will look like this:

```text
LoadData -> ProcessData -> SaveData
```

#### Define Events

Open:

```text
workflows/data_processing/events.py
```

Replace the generated example with three events:

```python
import typing

from volnux import Event


class LoadData(Event):
    def process(
        self, *args: typing.Any, **kwargs: typing.Any
    ) -> typing.Tuple[bool, typing.Any]:
        data = {
            "items": ["apple", "banana", "orange"]
        }

        print("Loaded data:", data)

        return True, data


class ProcessData(Event):
    def process(
        self, *args: typing.Any, **kwargs: typing.Any
    ) -> typing.Tuple[bool, typing.Any]:
        data = kwargs.get("data") or {}

        items = data.get("items", [])
        processed_items = [item.upper() for item in items]

        result = {
            "processed_items": processed_items
        }

        print("Processed data:", result)

        return True, result


class SaveData(Event):
    def process(
        self, *args: typing.Any, **kwargs: typing.Any
    ) -> typing.Tuple[bool, typing.Any]:
        data = kwargs.get("data") or {}

        print("Saving data:", data)
        print("Workflow completed successfully.")

        return True, data
```

Each event represents one unit of work in the workflow.

The `process()` method is where the event logic lives. It returns two values:

```python
return True, data
```

The first value indicates whether the event succeeded. The second value is the result produced by the event.

#### Define the Pipeline

Open:

```text
workflows/data_processing/pipeline.py
```

Update the pipeline so it references the events and describes the task order:

```python
from volnux import Pipeline

from .events import LoadData, ProcessData, SaveData


class DataProcessingPipeline(Pipeline):
    class Meta:
        pointy = "LoadData |-> ProcessData |-> SaveData"
```

The pipeline tells Volnux which events are part of the workflow and how they should be connected.

The `pointy` value defines the execution order:

```text
LoadData |-> ProcessData |-> SaveData
```

This means:

1. Run `LoadData`.
2. If it succeeds, run `ProcessData`.
3. If that succeeds, run `SaveData`.


#### Define the Workflow Configuration

Open:

```text
workflows/data_processing/workflow.py
```

Make sure the workflow configuration points to your pipeline:

```python
from volnux.engine.workflows import WorkflowConfig

from .pipeline import DataProcessingPipeline


class DataProcessingWorkflow(WorkflowConfig):
    name = "data_processing"
    version = "0.1.0"
    mode = "cfg"
    pipeline = DataProcessingPipeline

    def ready(self):
        pass
```

The workflow configuration is what Volnux uses to discover and run your workflow.

It defines:

- the workflow name
- the workflow version
- the parser mode
- the pipeline class to execute

#### Define the Pointy-Lang File

Open:

```text
workflows/data_processing/dataprocessing.pty
```

Add the same workflow structure using Pointy-Lang:

```text
LoadData |-> ProcessData |-> SaveData
```

The `.pty` file is useful when you want to keep the task graph outside of the Python pipeline class.

For this quickstart, the flow is intentionally simple: each event runs after the previous event succeeds.

#### Validate the Workflow

Before running the workflow, validate it:

```bash
volnux workflow validate data_processing
```

If the workflow is configured correctly, it should be ready to run.

### Run a Workflow

To run a workflow, use:

```bash
volnux workflow run data_processing
```

By default, this runs the workflow as a single execution.


### Next Steps

You will usually spend most of your time editing:

- `events.py` for task behavior
- `pipeline.py` for pipeline inputs and structure
- the `.pty` file for task relationships
- `workflow.py` for workflow-level configuration

Volnux gives you a structured way to move from a simple local workflow to more advanced event-driven automation as your project grows.
