# Welcome to Volnux

_The high-performance orchestration framework that replaces spaghetti code with declarative, scalable pipelines._

---

**Source Code**: [https://github.com/nshaibu/volnux](https://github.com/nshaibu/volnux)

---

If you've ever built a system that needs to fetch data, process it, handle retries, and execute parallel tasks based on conditional logic, you know how quickly the code turns into an unmaintainable mess of `if/else` statements and deeply nested `try/catch` blocks.

**Volnux fixes this.** 

It provides a clean separation between **what** your code does (the execution) and **when/how** it runs (the orchestration). By combining standard Python with **Pointy-Lang**—our custom domain-specific language for modeling workflows—Volnux lets you build resilient, event-driven systems that are easy to read, visualize, and scale.

## Core Concepts

Understanding Volnux comes down to three simple concepts:

1. **Events**: The workers. An Event is a single unit of work (e.g., "FetchUser", "ProcessPayment"). It takes inputs, performs a task, and returns a success or failure status.
2. **Pointy-Lang**: The map. A lightweight DSL (usually a `.pty` file) that wires your Events together using arrows (`->` for sequential, `||` for parallel). 
3. **Pipelines**: The engine. The Pipeline reads your Pointy-Lang map, provisions the data, and orchestrates the execution of your Events across threads or processes.

## Quick Start: Zero to Pipeline

Let's build a pipeline that fetches data, processes two tasks in parallel, and saves the result. 

### 1. Installation

```bash
pip install volnux
```

### 2. Define the Workflow (Pointy-Lang)

Create a file named `simple_flow.pty`. This is where we define the logic. Notice how expressive and readable this is compared to Python boilerplate:

```pty
# Fetch data, then run ProcessA and ProcessB in parallel, then pipe to Save.
FetchData -> (ProcessA || ProcessB) |-> SaveResult
```

### 3. Write the Code

Now, let's implement the Events and the Pipeline in Python.

```python
from volnux import EventBase, Pipeline
from volnux.fields import InputDataField

# 1. Define Events (The Workers)
class FetchData(EventBase):
    def process(self, data_id: str, **kwargs):
        print(f"Fetching data for {data_id}...")
        return True, {"raw": "some_data"}

class ProcessA(EventBase):
    def process(self, *args, **kwargs):
        print("Processing A in parallel...")
        return True, "Result A"

class ProcessB(EventBase):
    def process(self, *args, **kwargs):
        print("Processing B in parallel...")
        return True, "Result B"

class SaveResult(EventBase):
    def process(self, *args, **kwargs):
        print("Saving final results!")
        return True, "Saved"

# 2. Define the Pipeline (The Engine)
class MyPipeline(Pipeline):
    # Typed input fields that travel with the run
    data_id = InputDataField(data_type=str, required=True)

    class Meta:
        file = "simple_flow.pty"

if __name__ == "__main__":
    # 3. Execute
    runner = MyPipeline(data_id="usr_123")
    runner.start()
```

When you run this, Volnux automatically handles the sequential execution, spins up parallel workers for `ProcessA` and `ProcessB`, and pipes their results into `SaveResult`.

## Why Volnux?

Volnux is built for production constraints. Here is what you get out of the box:

### 🛡️ Bulletproof Retries
Transient failures shouldn't crash your pipeline. Volnux lets you define sophisticated retry policies directly on your events.

```python
from volnux.base import RetryPolicy

class FlakyAPIEvent(EventBase):
    # Retry up to 5 times, with an exponential backoff, only on Timeouts.
    retry_policy = RetryPolicy(
        max_attempts=5, 
        backoff_factor=0.5, 
        max_backoff=5.0, 
        retry_on_exceptions=[TimeoutError]
    )
    
    def process(self, *args, **kwargs):
        # Your flaky logic here
        return True, "Success!"
```

_You can also define retries directly in your Pointy-Lang file: `5 * FlakyAPIEvent`._

### ⚡ Hybrid Concurrency
Maximize throughput without the headaches. Volnux allows you to mix `asyncio` for non-blocking network I/O with `multiprocessing` for heavy CPU-bound tasks. Just swap the `executor` on your Event, and Volnux handles the rest.

### 📦 Built-in Batching
Need to process a million records? Inherit from `BatchPipeline`, set a `batch_size` on your input field, and Volnux will automatically chunk your dataset and process the batches in parallel across multiple workers.

### 📡 Telemetry & Observability
Volnux ships with a **Soft Signaling** framework (a lightweight pub/sub system) and full **OpenTelemetry (OTEL)** integration. You can listen to lifecycle hooks (like `pipeline_execution_start` or `task_failed`) to emit metrics or trigger alerts without polluting your core business logic.

---

Ready to dive deeper? Check out the Pipeline Guide to master the Pointy-Lang syntax, or explore the API References for advanced configurations.

