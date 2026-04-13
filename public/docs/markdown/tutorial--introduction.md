# Introduction
**Simplify complex process automation with a flexible, high-performance framework.**

This library tackles the challenges of building reliable, scalable workflows by 
providing a clear separation between coordination and execution. It uses a declarative DSL, 
**Pointy-Lang**, to model your pipelines while managing the underlying complexity of concurrency, 
state, and task dependencies.

Build resilient automation that can handle anything from simple data processing to distributed, event-driven systems.

## What is a pipeline?

In Volnux, a **pipeline** is the top-level object that describes a **repeatable workflow**: what data enters the run, which **events** (steps of work) participate, and how those events are **wired together**—including order, parallelism, conditional branches, and retries. You implement a Python subclass of `Pipeline`, declare **input fields** for the workload, and attach a **Pointy** graph (or equivalent metadata) that names the events the engine should execute. The framework coordinates **dependencies, scheduling, and results** between events so you are not re-implementing that glue in every script.

## What is an event?

An **event** is a single unit of work the pipeline runs: a Python class (typically extending `EventBase`) whose job is to **take inputs, do something, and report success or failure** through the framework’s result types. Events are what Pointy-lang (or your graph metadata) **names and connects**; the engine **schedules** them, chooses an **executor** (in-process, thread, process, remote, and so on), applies **retry and routing** rules, and passes **state and results** to the next events. Thinking in events keeps each step small and testable while the pipeline owns orchestration.

## What is a signal?

A **signal** is a **lightweight publish–subscribe hook** inside the framework: named points in the lifecycle (for example around pipeline init, execution start/end, or event retries) where **listeners can react without being part of the main graph**. Signals are useful for **cross-cutting concerns**—logging, metrics, auditing, or integration with external systems—without hard-wiring that logic into every event. They complement events: **events do the work**, **signals observe and react** to how that work is progressing.

## Why use a pipeline?

Multi-step automation without a pipeline model usually spreads across **one-off scripts**: ordering is implicit, error handling is duplicated, and changing the flow means hunting through code. A pipeline gives you a **single, explicit place** to read and evolve the workflow, **typed inputs** that travel with the run, and **shared machinery** for concurrency, executors, signals, and telemetry. That makes real processes easier to **run reliably in production**, **explain to teammates**, and **extend** when requirements change.

## Features
- **Pointy-Lang DSL**: Define task dependencies, conditional logic, and parallel execution using an intuitive, graph-based syntax.
- **Hybrid Concurrency**: Leverage asyncio for non-blocking I/O and multiprocessing for true parallel execution of CPU-bound tasks.
- **Distributed Processing**: Supports remote task execution and manages state across multiple processes with minimal overhead.
- **Extensible Architecture**: Easily integrate custom event logic, task executors, and signals to fit any use case.

## Installation
To install the framework, simply use pip:

```bash
pip install volnux
```
