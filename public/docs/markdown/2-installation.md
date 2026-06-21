## Prerequisites
Before installing Volnux, ensure you have:

* **Python 3.10 or later**. Volnux uses modern Python features including asyncio, type hints, and pattern matching. Check your version:

  ```bash
  python --version
  ```

* **pip** — Python's package installer. It typically comes with Python. Verify:

  ```bash
  pip --version
  ```

* **A terminal**. Any shell will do — bash, zsh, PowerShell, Command Prompt.

* **Optional: a virtual environment**. While not required, a virtual environment keeps Volnux isolated from other Python projects:

  ```bash
  python -m venv volnux-env
  source volnux-env/bin/activate  # Linux/macOS
  volnux-env\Scripts\activate     # Windows
  ```

## Installing Volnux
Install the latest stable release from PyPI:

```bash
pip install volnux
```

This installs Volnux and its core dependencies. The package includes:

* The Volnux CLI (`volnux` command)
* The workflow engine
* Pointy-Lang parser and compiler
* Core executors (async, thread, process)
* SQLite backend (for local trigger state)
* OpenTelemetry integration

Optional dependencies can be installed for additional features:

```bash
# PostgreSQL backend support
pip install volnux[postgres]

# Redis backend support (checkpoints, HITL queue)
pip install volnux[redis]

# Remote execution via gRPC
pip install volnux[grpc]

# Celery workflow executor
pip install volnux[celery]

# Kubernetes workflow executor
pip install volnux[kubernetes]

# LLM providers for agentic AI
pip install volnux[openai]
pip install volnux[anthropic]

# Everything
pip install volnux[all]
```

## Verifying Installation
Confirm Volnux is installed and accessible:

```bash
volnux --version
```

You should see output similar to:

```text
volnux 2.0.0
```

Run `volnux` without arguments to see available commands:

```bash
volnux
```

Output:

```text
Usage: volnux [command] [options]

Commands:
  init                  Create a new Volnux project
  workflow              Manage workflows
  triggers              Manage triggers
  manifest              Manage project manifest
  dev                   Start development server
  publish               Publish to EventHub
  login                 Authenticate with remote engine
  audit                 Query audit trail
  mesh                  Manage P2P mesh
```

If you see this, Volnux is ready to use.

## Development Environment Setup
For local development, Volnux works out of the box with SQLite for trigger state. No additional configuration is needed.

Project layout after `volnux init`:

```text
my_project/
├── config.py              # Project-level configuration
├── init.py                # Engine initialization
├── workflows/             # Workflow definitions
│   └── __init__.py
├── commands/              # Custom CLI commands
│   └── __init__.py
├── logs/                  # Execution logs
├── tests/                 # Test directory
│   └── __init__.py
├── README.md
└── .gitignore
```

For production deployments, configure your persistence backends in `config.py`:

```python
# PostgreSQL for governance data
POSTGRES_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "volnux",
    "username": "volnux",
    "password": "your_password",
}

# Redis for checkpoints and HITL queue
REDIS_CONFIG = {
    "host": "localhost",
    "port": 6379,
    "db": 0,
}
```

For multi-node deployments, install the appropriate remote execution dependencies on each node. All nodes must run the same Volnux version and have access to the same event packages.

Next step: Head to **Getting Started** to create and run your first workflow.
