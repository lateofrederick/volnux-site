# Simple

## Before you start

- Install Volnux: `pip install volnux`
- Use a new folder and copy the files below with the **same paths** (`simple.py`, `simple.pty`, `events/` package, `__main__.py`).

## 1. Declare the graph (`simple.pty`)

Pointy describes **how events connect**. This file sets recursion depth and mode, then lists operators such as `||` (parallel), `->` (sequence), and `|->` (conditional). Event names match the Python classes you will register next.

```text
@recursive-depth: 3000
@mode: CFG

10 * Fetch || Process || Execute -> SaveToDB -> Return
```


## 2. Pipeline class and batch template (`simple.py`)

`Simple` is the pipeline template: `name` is an input field. `SimpleBatch` is optional batch scaffolding. The listener prints kwargs when the pipeline starts.

```python
from volnux.decorators import listener
from volnux.fields import InputDataField
from volnux.pipeline import BatchPipeline, Pipeline
from volnux.signal.signals import pipeline_execution_start


class Simple(Pipeline):
    name = InputDataField(data_type=str, batch_size=5)


class SimpleBatch(BatchPipeline):
    pipeline_template = Simple


@listener(pipeline_execution_start, sender=Simple)
def simple_listener(**kwargs):
    print(kwargs)
```


## 3. Event implementations (`events/` package)

Each class subclasses `EventBase` and implements `process`. Return `(True, payload)` for success. `Fetch` uses a **thread pool** executor; adjust per your workload.

**Package exports** — import every event class so the framework can resolve names used in the `.pty` file:

```python
from .execute import Execute
from .fetch import Fetch
from .process import Process
from .ereturn import Return
from .save_to_db import SaveToDB
```


**Fetch**

```python
import typing
from concurrent.futures import ThreadPoolExecutor
from volnux import EventBase


class Fetch(EventBase):
    executor = ThreadPoolExecutor

    def process(self, name) -> typing.Tuple[bool, typing.Any]:
        print(f"Executed fetch event: {name}")
        return True, "Executed fetch event"
```


**Process**

```python
import typing

from volnux import EventBase


class Process(EventBase):

    def process(self, *args, **kwargs) -> typing.Tuple[bool, typing.Any]:
        print("Executed process event")
        return True, "Executed process event"
```


**Execute**

```python
import typing
from concurrent.futures import ProcessPoolExecutor, ThreadPoolExecutor
from volnux import EventBase


class Execute(EventBase):
    executor = ThreadPoolExecutor

    def process(self, *args, **kwargs) -> typing.Tuple[bool, typing.Any]:
        print("Executed execute event")
        return True, "Executed execute event"
```


**SaveToDB**

```python
import typing

from volnux import EventBase


class SaveToDB(EventBase):

    def process(self, *args, **kwargs) -> typing.Tuple[bool, typing.Any]:
        print("Executed save-to-db event")
        return True, "Executed save-to-db event"
```


**Return**

```python
import typing

from volnux import EventBase


class Return(EventBase):

    def process(self, *args, **kwargs) -> typing.Tuple[bool, typing.Any]:
        print("Executed return event")
        return True, "Executed return event"
```


## 4. Run it (`__main__.py`)

This builds `Simple(name="home")` and calls `start(force_rerun=True)`. Uncomment helpers to draw the graph or try batch scheduling.

```python
from .simple import Simple, SimpleBatch

s = Simple(name="home")
s.start(force_rerun=True)
# s.draw_ascii_graph()

# batch = SimpleBatch(name=list(range(100)))
# batch.schedule_job(batch.ScheduleTrigger.CRON, second=10)
#
# import pdb
#
# pdb.set_trace()
```


## 5. Run from the example directory

```bash
cd examples/simple
python -m examples.simple
```

