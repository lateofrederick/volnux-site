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

### Project Structure

A generated Volnux project contains the files and folders needed to organize and run workflows.

#### `config.py`

The main project configuration file.

This is where project-level settings live, including the list of workflows available to the project. When you create workflows using the CLI, Volnux attempts to register them here automatically.

#### `init.py`

The project initialization file.

This file is used by Volnux when setting up the workflow system for the project.

#### `workflows/`

The directory where workflow definitions are stored.

Each workflow gets its own folder under `workflows/`, keeping workflow-specific configuration, pipeline logic, event definitions, and Pointy-Lang files together.

#### `commands/`

A place for project-specific commands or future command extensions.

#### `logs/`

A default location for runtime logs.

#### `tests/`

A place to add tests for workflow behavior, event logic, and project-specific automation.

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

### Understanding a Volnux Workflow

A Volnux workflow is usually made up of four main parts:

1. **Workflow configuration**
2. **Pipeline definition**
3. **Events or task handlers**
4. **Pointy-Lang workflow structure**

Together, these files describe what your workflow does, what tasks are involved, and how those tasks are connected.

### Workflow Files

#### `workflow.py`

This file contains the workflow configuration.

It defines information such as:

- the workflow name
- the workflow version
- the parser mode
- workflow execution settings
- whether the workflow is executable

You usually edit this file whuen you need to adjust how Volnux discovers, validates, or executes the workflow.

#### `pipeline.py`

This file contains the pipeline definition.

The pipeline connects your workflow configuration to the actual execution model. It is where you define pipeline-level behaviour, inputs, and how the workflow structure should be interpreted.

A simple workflow may describe a task sequence like this:

```text
LoadData -> ProcessData -> SaveData
```

This means:

1. `LoadData` runs first.
2. `ProcessData` runs after `LoadData`.
3. `SaveData` runs after `ProcessData`.

#### `events.py`

This file contains the events or task handlers used by the workflow.

Events represent the actual units of work in the workflow. For example, a data processing workflow might include events suc as:

- `ExtractData`
- `TransformData`
- `LoadData`

Each event should contain the logic needed to perform the step.

#### `.pty` File

The `.pty` file contains the Pointy-Lang workflow definition.

Pointy-Lang is Volnux's declarative syntax for describing how workflow tasks are connected.

For example:

```text
LoadData |-> ProcessData |-> SaveData
```

This describes a linear workflow where each task runs after the previous one completes.

You can use Pointy-Lang to model more advanced workflow structures as your project grows, including branching, conditional paths, and parallel execution patterns.

### Choose a Workflow Parser Mode

When creating a workflow, you can choose how Volnux should parse and interpret the workflow structure.

The default mode is `cfg`:

```bash
volnux workflow init data_processing --mode cfg
```

You can also create a workflow using `dag` mode:

```bash
volnux workflow init data_processing --mode dag
```

Available modes:

```text
cfg
dag
```

Use the mode that best matches how you want your workflow graph to be interpreted.

### Choose an Event Template

Volnux can scaffold event logic in two styles:

- class-based events
- function-based events

Class-based events are used by default:

```bash
volnux workflow init data_processing --event-template class
```

To generate function-based events instead:

```bash
volnux workflow init data_processing --event-template function
```

Use class-based events when you want more structure and extensibility.

Use function-based events when you want a smaller, simpler starting point.

### Create a Batch Workflow

Some workflows need to process data in batches rather than as a single execution.

To scaffold a workflow with batch support, use:

```bash
volnux workflow init data_processing --create-batch-pipeline
```

This adds a `batch_pipeline.py` file to the workflow:

```text
workflows/data_processing/
├── __init__.py
├── workflow.py
├── pipeline.py
├── batch_pipeline.py
├── events.py
└── dataprocessing.pty
```

You can then run the workflow in batch mode:

```bash
volnux workflow run data_processing --type batch
```

### List Available Workflows

To see which workflows are available in the current project, run:

```bash
volnux workflow list
```

Example output:

```text
Availabe Workflows:

  ✓ data_processing

Total: 1 workflow(s)
```

A check mark indicates that the workflow is available and executable.

### Validate Workflows

Before running a workflow, validate it to catch configuration or definition issues early.

To validate every workflow in the project:

```bash
volnux workflow validate
```

To validate a specific workflow:

```bash
volnux workflow validate data_processing
```

Validation can help identify issues such as:

- missing configuration
- invalid task references
- incorrect workflow definitions
- problems in the Pointy-Lang structure
- workflows that are not executable

### Run a Workflow

To run a workflow, use:

```bash
volnux workflow run data_processing
```

By default, this runs the workflow as a single execution.

You can also specify the execution type explicitly:

```bash
volnux workflow run data_processing --type single
```

### Pass Parameters to a Workflow

Runtime parameters can be passed using the `--params` option.

Parameters must be provided as a JSON string:

```bash
volnux workflow run data_processing --params '{"input_path": "data/input.csv", "output_path": "data/output.csv"}'
```

These parameters can be used by your workflow to control runtime behaviour, such as:

- input locations
- output destinations
- batch sizes
- filters
- limits
- environment-specific settings

### Run a Batch Workflow

If your workflow was created with batch support, run it with:

```bash
volnux workflow run data_processing --type batch
```

You can also pass parameters to a batch workflow:

```bash
volnux workflow run data_processing --type batch --params '{"batch_size": 100}'
```

### Create a Project in a Custom Location

By default, `volnux init` creates the project in the current directory.

To create the project somewhere else, use `--path`:

```bash
volnux init my_project --path /path/to/projects
```

This creates the project at:

```text
/path/to/projects/my_project
```

### Overwrite an Existing Project

If a project already exists, Volnux will not overwrite it by default.

To overwrite an existing project directory, use `--force`:

```bash
volnux init my_project --force
```

Use this carefully, especially if the existing project contains custom workflow logic.

### Recommended Development Flow

A typical Volnux workflow development process looks like this:

1. Create a project.

   ```bash
   volnux init my_project
   ```

2. Enter the project.

   ```bash
   cd my_project
   ```

3. Create a workflow.

   ```bash
   volnux workflow init data_processing
   ```

4. Edit the generated workflow files.

   ```text
   workflows/data_processing/workflow.py
   workflows/data_processing/pipeline.py
   workflows/data_processing/events.py
   workflows/data_processing/dataprocessing.pty
   ```

5. Validate the workflow.

   ```bash
   volnux workflow validate data_processing
   ```

6. Run the workflow.

   ```bash
   volnux workflow run data_processing
   ```

### Next Steps

After setting up your first workflow, replace the generated scaffold with your own application logic.

You will usually spend most of your time editing:

- `events.py` for task behavior
- `pipeline.py` for pipeline inputs and structure
- the `.pty` file for task relationships
- `workflow.py` for workflow-level configuration

Once your workflow is defined, use the CLI to validate and run it locally:

```bash
volnux workflow validate
volnux workflow run data_processing
```

Volnux gives you a structured way to move from a simple local workflow to more advanced event-driven automation as your project grows.
