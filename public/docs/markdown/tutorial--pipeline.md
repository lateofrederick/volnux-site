# Pipeline

## Defining Pipelines

To define a pipeline, import the `Pipeline` class using `from volnux import Pipeline` and create a new class that
inherits from it. This custom class will define the behavior and structure of your pipeline.

```python
from volnux import Pipeline

class MyPipeline(Pipeline):
    # Define input fields as class attributes here
    pass

```

## Defining Input Data Field
Import the `InputDataField` (or another field class) from the `volnux.fields` module.

The `InputDataField` class is used to declare input fields for your pipeline. Define these fields as class attributes
on your pipeline class; they represent the data that will flow through the pipeline. Events can access input field
values by including the field name in their `process` method signature.

```python
from volnux import Pipeline
from volnux.fields import InputDataField

class MyPipeline(Pipeline):
    # Define input fields as attributes
    input_field = InputDataField(data_type=str, required=True)  # Define an input field

```

## Defining Pipeline Structure Using Pointy language
The next step is to define the structure and flow of your pipeline using the pointy language. 
The pointy file provides a structured format to describe how the pipeline should execute, 
including the order of tasks, conditions, and dependencies.

```pty
Fetch -> Process -> Execute -> SaveToDB -> Return
```

The pointy file `.pty` describes the flow of tasks and their dependencies, allowing you to build dynamic 
and conditional pipelines based on the results of previous executed event.

By default, if the name of your pointy file matches the name of your pipeline class, the library 
will automatically load the pointy file for you. For example, if your class is named MyPipeline, 
it will automatically look for a file named `MyPipeline.pty`.

If you want to use a pointy file with a different name, you can define a Meta subclass inside 
your pipeline class. 

This subclass should specify the file or pointy property:

- `pointy`: The string of the pointy script.
- `file`: The full path to your pointy file.

Example of how to define the Meta subclass:
```python
class MyPipeline(Pipeline):
    class Meta:
        pointy = "A->B->C"  # Pointy script
        # OR
        file = "/path/to/your/custom_pipeline.pty"  # Full path to your pointy file

# You can also define the options as dictionary

class MyPipeline(Pipeline):
    meta = {
        "pointy": "A->B->C",
        # OR
        "file": "/path/to/your/custom_pipeline.pty"
    }
```

## Pointy Language
Pointy Language is a domain-specific language (**DSL**) designed to model and execute event-based workflows. It allows 
you to define sequences of operations, conditional branching, parallel execution, and result piping in a simple and 
expressive syntax. The language uses arrows (`->`, `||`, `|->`) to represent event flow, direction, and parallelism. 
This documentation provides an overview of the syntax and examples of common usage.

The Pointy Language DSL provides a concise and expressive way to define the structure, flow, and logic of your event-driven pipelines, making it easier to manage complex dependencies and execution paths.

### Operators

The following operators are used in Pointy Language to define the flow, dependencies, and logic of your event-driven pipelines.

- **Directional Operator (`->`):**
The `->` operator is used to define a sequential flow of events. It represents the execution of one event followed by another. 
It indicates that the first event must be completed before the second event begins.
```pty
A -> B   # Execute event A, then execute event B
```

- **Parallel Operator (`||`):**
The `||` operator is used to execute two or more events in parallel. The events are executed concurrently, allowing for 
parallel execution.
```pty
A || B   # Execute event A and event B in parallel
```

- **Pipe Result Operator (`|->`):**
The `|->` operator is used to pipe the result of one event to another. It can be used in conjunction with sequential 
or parallel operations. This allows the output of one event to be passed as input to another event.
```pty
A |-> B  # Pipe the result of event A into event B
```

- **Conditional Branching (`(0 -> X, 1 -> Y)`):**
Conditional branching is used to define different execution paths based on the success or failure of an event. 
The condition is checked after the event's execution: `0` represents failure, and `1` represents success. 
Based on these outcomes, the next event(s) are chosen.
```pty
A -> B (0 -> C, 1 -> D)  # If B fails (0), execute C; if B succeeds (1), execute D
In Pointy Language, the `*` operator is used to retry an event in the case of failures or exceptions.
The syntax supports both postfix (`A * 3`) and prefix (`3 * A`) notation to specify the retry factor, and both forms are accepted; however, postfix notation (`A * 3`) is canonical and preferred in documentation and examples.
The `*` operator specifies that the event should be retried a certain number of times if an exception occurs. 
This number is known as the retry factor. The factor must be greater than 1 for the retry operation to be activated. 
The retry operation triggers for all exceptions that occur during the execution of the event. However, it can be 
configured to exclude certain exceptions. If specific exceptions are listed in the event configuration, 
retries will not be attempted for those exceptions.
If a retry policy has already been set for the event, the `*` operator will override the maximum retry count defined earlier. 
This means that the retry factor specified by * will take precedence, even if there was a previous retry limit in place.
retries will not be attempted for those exceptions.
If a retry policy has already been set for the event, the `*` operator will override the maximum retry count defined earlier. 
This means that the retry factor specified by * will take precedence, even if there was a previous retry limit in place.
```pty
A * 3 # Retries the A event a maximum of 3 times if any exception occurs

51 * A # Retries the A event a maximum of 51 times if any exception occurs
```

- **Descriptors (`0 - 9`):** 
Descriptors are numeric values used for conditional branching in Pointy Language. 
They are integral to defining which event node should be executed based on the success or failure state of the 
previous event. Descriptors are associated with specific execution outcomes—such as success or failure—and 
help determine the flow of execution.
  - ***Descriptor `0` (Failure)***: 
    Descriptor `0` denotes a failure state. It is used to specify the node to execute when the previous event has failed. 
    If an event fails, the flow of execution will follow the branch defined by descriptor `0`.
  - ***Descriptor `1` (Success)***:
  Descriptor 1 denotes a success state. It is used to specify the node to execute when the previous event has succeeded. 
  If an event succeeds, the flow of execution will follow the branch defined by descriptor `1`.
  - ***Descriptors `3 - 9` (User-defined Conditions)***: 
  Descriptors 3 through 9 are available for user-defined conditions. These descriptors can be used to specify additional 
  conditional logic in your workflow. The user can assign any condition to these descriptors, allowing for more complex 
  branching logic. Each of these descriptors can be assigned to events based on custom conditions defined by the user.

**Example of mapping a custom condition to a descriptor in code:**

Suppose you want to use descriptor `3` to represent a custom condition, such as "input value is greater than 100". You can map this in your event or pipeline configuration as follows:

```pty
A -> B (0 -> C, 1 -> D, 3 -> E)  # Use descriptor 3 to define a custom condition for event E
```
In this case:

- If event B fails (0), execute event C.
- If event B succeeds (1), execute event D.
- If the user-defined condition (descriptor 3) is met, execute event E.

## Syntax Guide

### Single Event
A single event is represented by a single event name. It can be thought of as a unit of work that is executed.
```pty
A    # Single event A
```

### Directional Operation
A directional operation represents the execution of one event followed by the execution of another event. 
The arrow (`->`) denotes the sequence of execution.
```pty
A -> B   # Execute event A, then execute event B
```

### Parallel Operation
Parallel operations are used to execute two or more events concurrently. The `||` operator denotes parallel execution.
```pty
A || B   # Execute event A and event B in parallel
```
You can also pipe the results of parallel events to another event using the `|->` operator.
```pty
A || B |-> C  # Execute event A and event B in parallel, then pipe their results to event C
```

### Two Events with Result Piping
This syntax allows you to pipe the result of one event to another. The `|->` operator is used to send the 
output of an event as input to another event.

```pty
A |-> B  # Pipe the result of event A into event B
```

### Multiple Events with Branching
Branching allows you to define different paths of execution based on the success or failure of events. 
A branch consists of a condition (either 0 for failure or 1 for success) that leads to different events.

```pty
A -> B (0 -> C, 1 -> D)  # If event B fails (0), execute event C; if event B succeeds (1), execute event D
```

### Multiple Events with Sink
In this case, an event executes, and depending on the result (0 for failure, 1 for success), it moves to 
different events. 
The `->` operator continues the execution flow, while the branches determine what to do with success and failure.

```pty
A (0 -> B, 1 -> C) -> D  # Execute event A, then on failure (0) execute event B, on success (1) execute event C, then finally execute event D
```

### Example
This is an example of a more complex workflow using the constructs described above. It demonstrates multiple levels of 
branching, parallel execution, result piping, and the use of descriptors.

```pty
A -> B (
    0->C (
        0 |-> T,  # If C fails, pipe result to T
        1 -> Z    # If C succeeds, execute Z
    ),
    1 -> E    # If B succeeds, execute event E
) -> F (
    0 -> Y,   # If F fails, execute event Y
    1 -> Z    # If F succeeds, execute event Z
)
```

In this example:

1. Event A is executed first.
2. Then, event B is executed. If event B fails (0), event C is executed. If event B succeeds (1), event E is executed.
3. Event C has its own branching: if it fails (0), event T is executed, and if it succeeds (1), event Z is executed.
4. Finally, event F is executed. If event F fails (0), event Y is executed, and if event F succeeds (1), event Z is executed.

This is the graphical representation of the above pipeline

![pipeline](https://raw.githubusercontent.com/nshaibu/volnux/main/img/Simple.png)

To draw your pipeline:
```python
# instantiate your pipeline class
pipeline = MyPipeline()

# draw ascii representation
pipeline.draw_ascii_graph()

# draw graphical representation # (requires graphviz, xdot)
pipeline.draw_graphviz_image(directory=...)

```

## Executing Pipeline
Execute your pipeline by making calls to the `start` method:

```python
# instantiate your pipeline class
pipeline = MyPipeline(input_field="value")

# call start
pipeline.start()
```

## Pipeline Batch Processing
The Pipeline Batch Processing feature enables you to process multiple batches of data in parallel, enhancing performance 
and efficiency when dealing with large datasets or time-sensitive tasks. This is accomplished using a pipeline template, 
which defines the structure of the pipeline, and the BatchPipeline class, which orchestrates the parallel execution of 
pipeline instances.

### Create a Pipeline Template
The first step is to create a pipeline template by defining a pipeline class that inherits from the Pipeline class. 
The pipeline template serves as a scheme that outlines the structure and logic of the pipeline, including inputs, 
transformations, and outputs. 

It acts as the blueprint for the kind of pipeline you want to create and execute. 
This template will be used to generate multiple instances of the pipeline, each one customized for different execution 
contexts, depending on the data you plan to process.

***Example:***
```python
from volnux import Pipeline
from volnux.fields import InputDataField, FileInputDataField

class Simple(Pipeline):
    name = InputDataField(data_type=list, batch_size=5)
    book = FileInputDataField(required=True, chunk_size=1024)
```

***Explanation:***

Simple is a subclass of Pipeline that defines the pipeline structure.
name is an InputDataField with data_type=list and a batch_size of 5, meaning the pipeline will process data in batches of 5.

## Create the Batch Processing Class
Next, define the batch processing class by inheriting from BatchPipeline. This class is responsible for orchestrating 
the parallel execution of the pipeline template you just created.

***Example:***

```python
from volnux.pipeline import BatchPipeline
from volnux.signal import SoftSignal

class SimpleBatch(BatchPipeline):
    pipeline_template = Simple
    listen_to_signals = [SoftSignal('task_completed'), SoftSignal('task_failed')]
```

***Explanation:***

- `SimpleBatch` inherits from BatchPipeline and sets the pipeline_template to the Simple pipeline class, meaning that 
SimpleBatch will use the Simple pipeline as its template for processing batches.
- `listen_to_signals` defines the signals the batch pipeline listens to (such as task_completed or task_failed), allowing 
you to monitor the progress and react to events during execution.

## How the Batch Pipeline Works
The BatchPipeline class is the core component that manages the execution of batches. It uses the defined pipeline 
template to create separate pipeline instances, each of which processes a different batch of data in parallel. 
The pipeline template must be a subclass of Pipeline.

- ***Attributes:***
    - `pipeline_template`: The pipeline class (such as Simple) that serves as the template for creating individual pipeline instances.
    - `listen_to_signals`: A list of signals that the batch pipeline listens to. Signals provide a way to track events 
    such as task completion or failure.

### How It Works:
The BatchPipeline class orchestrates the execution of the pipeline template in parallel across multiple batches.
- `Pipeline template`: The pipeline_template defines the structure of each pipeline in the batch. Each batch processes
a different subset of data according to the template.
- `Signal handling`: The `listen_to_signals` attribute is used to capture and respond to events such as task completion 
or failures. This helps in tracking progress and debugging.

## Define the Data Set for Processing
Once the pipeline class and batch processing class are set up, prepare the dataset you want to process. This dataset 
will be split into smaller batches based on the batch size defined in the pipeline template (batch_size=5 in the example).

## Configure and Execute the Batch Pipeline
After defining the batch pipeline class, you can configure it to process your data. The BatchPipeline will automatically 
create multiple instances of the pipeline_template (such as Simple) and execute them in parallel.

To trigger the batch pipeline execution, you just need to invoke it, and it will process the batches as defined.

## Monitor and Optimize Execution
You can integrate OpenTelemetry to monitor the performance of the batch pipeline and collect telemetry data, 
such as execution time and error rates.

Additionally, Soft Signals are used to signal key events during the execution, like task_completed or task_failed, 
which helps in tracking the progress and responding to events in real-time.

***Optimization:***
Adjust the max number of tasks per child configuration to balance the workload and optimize throughput.
Fine-tune the configuration based on system resources to ensure optimal performance during parallel execution.

***Full Example:***
Batch Pipeline with Parallel Execution
Here’s a full example that demonstrates the creation and configuration of a batch processing pipeline:

```python
from volnux import Pipeline
from volnux.pipeline import BatchPipeline, InputDataField, SoftSignal

class Simple(Pipeline):
    name = InputDataField(data_type=list, batch_size=5)

class SimpleBatch(BatchPipeline):
    pipeline_template = Simple
    listen_to_signals = []

# Create an instance of SimpleBatch to trigger the batch pipeline
simple_batch = SimpleBatch()
simple_batch.execute()  # Trigger execution of the batch pipeline
```
***Explanation:***
- Simple is the pipeline template that processes batches of 5 items at a time.
- SimpleBatch inherits from `BatchPipeline`, using Simple as the template for parallel execution.
- The batch pipeline listens for task_completed and task_failed signals, enabling you to monitor events during execution.
`simple_batch.execute()` runs the pipeline and processes data in parallel batches.
