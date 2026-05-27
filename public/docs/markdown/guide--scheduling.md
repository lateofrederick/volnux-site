# Scheduling

Volnux includes a built-in `Pipeline Scheduler` designed to manage and execute pipeline jobs automatically at specified times or intervals. Because the `Pipeline` base class inherits from `ScheduleMixin`, scheduling is seamlessly integrated into every pipeline you create.

Behind the scenes, Volnux leverages a global `BackgroundScheduler` (via APScheduler) to ensure jobs run reliably in the background without blocking your main application thread.

## How to Schedule a Pipeline

To schedule a pipeline, you instantiate it, then call the `schedule_job()` method, providing a `ScheduleTrigger` and the relevant timing arguments.

There are three types of triggers available:
- **`CRON`**: Triggers based on cron-like time constraints.
- **`DATE`**: Triggers exactly once at a specific date and time.
- **`INTERVAL`**: Triggers continuously on a recurring interval.

### 1. Cron Scheduling

The `ScheduleTrigger.CRON` trigger works like a UNIX cron scheduler. It runs the pipeline whenever the current time matches all specified constraints.

```python
from volnux import Pipeline
from volnux.mixins.schedule import ScheduleMixin

class DailyReportPipeline(Pipeline):
    pass

pipeline = DailyReportPipeline()

# Run every weekday (Monday to Friday) at 6:30 AM
pipeline.schedule_job(
    trigger=ScheduleMixin.ScheduleTrigger.CRON,
    day_of_week='mon-fri',
    hour=6,
    minute=30
)
```

**Cron Arguments**:
- `year`, `month`, `day`, `week`, `day_of_week` (0-6 or mon-sun)
- `hour`, `minute`, `second`
- `start_date`, `end_date` (datetime objects)
- `timezone`
- `jitter` (delay the job execution by at most `jitter` seconds)

### 2. Interval Scheduling

The `ScheduleTrigger.INTERVAL` trigger runs the pipeline repeatedly with a specific amount of time between each execution.

```python
pipeline = DailyReportPipeline()

# Run the pipeline every 2 hours and 15 minutes
pipeline.schedule_job(
    trigger=ScheduleMixin.ScheduleTrigger.INTERVAL,
    hours=2,
    minutes=15
)
```

**Interval Arguments**:
- `weeks`, `days`, `hours`, `minutes`, `seconds`
- `start_date`, `end_date`
- `timezone`
- `jitter`

### 3. Date Scheduling

The `ScheduleTrigger.DATE` trigger runs the pipeline exactly once at a specific point in time. If you don't provide a `run_date`, it executes immediately.

```python
from datetime import datetime, timedelta

pipeline = DailyReportPipeline()

# Run exactly once, 24 hours from now
run_at = datetime.now() + timedelta(days=1)

pipeline.schedule_job(
    trigger=ScheduleMixin.ScheduleTrigger.DATE,
    run_date=run_at
)
```

**Date Arguments**:
- `run_date` (datetime object or string)
- `timezone`

## Accessing the Underlying Scheduler

If you need advanced control (like pausing jobs, listing scheduled jobs, or shutting down the scheduler), you can access the underlying APScheduler instance:

```python
scheduler = DailyReportPipeline.get_pipeline_scheduler()

# Print all currently scheduled jobs
scheduler.print_jobs()

# Shut down the scheduler
scheduler.shutdown()
```

