# Fields & Data API

This section details the classes used to define data flowing into and out of Volnux Pipelines.

---

## `InputDataField`

Defines an expected input variable for a Pipeline. These fields act as the schema definition for data entering your workflow.

**Location**: `volnux.fields.InputDataField`

### Initialization Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `data_type` | `Type` | `Any` | The expected Python type of the incoming data (e.g., `str`, `int`, `list`). Used for validation and type hinting. |
| `required` | `bool` | `True` | If `True`, pipeline initialization will fail if this field is not provided. |
| `default` | `Any` | `None` | A default value to use if the field is not provided during pipeline initialization. |
| `batch_size` | `int` | `None` | (Used by `BatchPipeline`). If set, the orchestrator will automatically chunk the input data into parallel batches of this size. Requires `data_type` to be an iterable like `list`. |

### Example Usage

```python
from volnux.pipeline import Pipeline
from volnux.fields import InputDataField

class UserPipeline(Pipeline):
    user_id = InputDataField(data_type=str, required=True)
    metadata = InputDataField(data_type=dict, required=False, default={})
```

---

## `OutputDataField`

*(Advanced)* Defines expected output schema variables for events or pipelines that need strict output validation.

**Location**: `volnux.fields.OutputDataField`

### Initialization Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `data_type` | `Type` | `Any` | The expected Python type of the outgoing data. |
| `required` | `bool` | `True` | If `True`, validation will fail if the event does not return this data in its result payload. |

