The Volnux CLI is divided into two categories: project commands for local development and runtime commands for managing deployed engines. Both share the same command framework and output styling.

## Project Commands
Project commands operate on local files. They require no authentication and no running engine. Use them for development, validation, and publishing.

### volnux init
Create a new Volnux project with the standard scaffold.

```bash
volnux init my_project
```

Options:

| Option | Description | Default |
| :--- | :--- | :--- |
| `--template` | Project template to use | `default` |
| `--no-git` | Skip git initialization | `false` |

Generated structure:
```text
my_project/
├── config.py
├── init.py
├── workflows/
│   └── __init__.py
├── commands/
│   └── __init__.py
├── logs/
├── tests/
│   └── __init__.py
├── README.md
└── .gitignore
```

### volnux workflow init
Create a new workflow within an existing project.

```bash
volnux workflow init data_processing
```

Options:

| Option | Description | Default |
| :--- | :--- | :--- |
| `--mode` | Execution mode: dag or cfg | `cfg` |
| `--template` | Workflow template | `default` |

Generated structure:
```text
workflows/data_processing/
├── __init__.py
├── workflow.py
├── pipeline.py
├── events.py
└── dataprocessing.pty
```

### volnux validate
Validate a workflow's Pointy-Lang syntax, event resolution, and graph structure.

```bash
volnux workflow validate data_processing
```

Options:

| Option | Description |
| :--- | :--- |
| `--strict` | Enable strict validation (deprecation warnings become errors) |
| `--format` | Output format: text or json |

Success output:
```text
✓ Workflow 'data_processing' is valid.
  Mode: CFG
  Events: 3 (LoadData, ProcessData, SaveData)
  Graph: LoadData |-> ProcessData |-> SaveData
```

Error output:
```text
✗ Workflow 'data_processing' has errors:
  - Event 'SaveData' is not defined in events.py or registered sources.
  - Pointy-Lang syntax error at line 1: unexpected token '|->>'
```

### volnux build
Compile the Pointy-Lang graph to an in-memory representation. Useful for debugging and static analysis.

```bash
volnux workflow build data_processing
```

Options:

| Option | Description |
| :--- | :--- |
| `--output` | Output file for compiled graph (JSON) |
| `--visualize` | Generate a Graphviz visualization |

Output:
```json
{
    "workflow": "data_processing",
    "mode": "CFG",
    "events": ["LoadData", "ProcessData", "SaveData"],
    "edges": [
        {"from": "LoadData", "to": "ProcessData", "type": "stream"},
        {"from": "ProcessData", "to": "SaveData", "type": "stream"}
    ],
    "subgraphs": [],
    "conditionals": []
}
```

### volnux manifest generate
Detect the project type and generate a `volnux.manifest.json` file.

```bash
volnux manifest generate
```

Options:

| Option | Description |
| :--- | :--- |
| `--project-type` | Force project type: event or workflow |
| `--output` | Output path for the manifest |

Detection logic:
* `workflows/` directory with `WorkflowConfig` subclasses → workflow type
* Directories with `EventBase` subclasses, no `workflows/` → event type

### volnux manifest validate
Validate an existing manifest against the EventHub JSON Schema.

```bash
volnux manifest validate
```

Options:

| Option | Description |
| :--- | :--- |
| `--schema` | Path to custom schema file |
| `--strict` | Warnings become errors |

### volnux publish
Publish the project to EventHub.

```bash
volnux publish
```

Options:

| Option | Description |
| :--- | :--- |
| `--registry` | EventHub registry URL |
| `--api-key` | API key for authentication |
| `--no-validate` | Skip pre-publish validation |
| `--dry-run` | Validate and package but don't upload |

Requirements:
* `volnux.manifest.json` must exist and be valid
* API key with publish permissions
* Network access to the EventHub registry

### volnux dev
Start a local development server with hot reload.

```bash
volnux dev
```

Options:

| Option | Description | Default |
| :--- | :--- | :--- |
| `--host` | Bind address | `localhost` |
| `--port` | Bind port | `8080` |
| `--no-reload` | Disable file watching | `false` |
| `--no-dashboard` | Disable web dashboard | `false` |

What it starts:
* Local Volnux engine with all workflows loaded
* REST API at `http://localhost:8080`
* Web dashboard at `http://localhost:8080/dashboard`
* File watchers that reload on code changes
* All triggers active

## Runtime Commands
Runtime commands communicate with a running Volnux engine via the REST API. They require authentication and network access to the engine.

### volnux login
Authenticate with a remote Volnux engine.

```bash
volnux login --host volnux-prod.internal:8080
```

Options:

| Option | Description |
| :--- | :--- |
| `--host` | Engine host and port |
| `--username` | Username (prompts if not provided) |
| `--password` | Password (prompts if not provided) |
| `--insecure` | Disable TLS verification |

Authentication flow:
* POST credentials to `/api/v1/auth/login`
* Receive JWT (access token + refresh token)
* Store in `~/.volnux/credentials`
* Subsequent commands use stored token
* Automatic refresh on expiry

### volnux triggers list
List all triggers and their current status.

```bash
volnux triggers list
```

Options:

| Option | Description |
| :--- | :--- |
| `--workflow` | Filter by workflow name |
| `--status` | Filter by status: active, paused, stopped |
| `--format` | Output format: table or json |

Output:
```text
NAME                    LIFECYCLE    FIRES    ERRORS    LAST FIRED
trade-schedule          active       1,423    0         2024-06-19T06:00:00Z
rehydration-manager     active       892      12        2024-06-19T12:45:00Z
s3-file-watcher         paused       45       3         2024-06-18T22:00:00Z
webhook-github          stopped      0        0         -
```

### volnux triggers pause
Pause an active trigger.

```bash
volnux triggers pause trade-schedule
```

The trigger completes its current activation (if any), then pauses. No new workflow executions are started while paused. Pending activations remain queued.

### volnux triggers resume
Resume a paused trigger.

```bash
volnux triggers resume trade-schedule
```

The trigger resumes from its paused state. Queued activations (if any) are processed.

### volnux triggers stop
Stop a trigger entirely.

```bash
volnux triggers stop s3-file-watcher
```

The trigger completes its current activation, then stops. It will not fire again until restarted via the workflow configuration.

### volnux triggers info
View detailed information about a trigger.

```bash
volnux triggers info trade-schedule
```

Output:
```text
Name: trade-schedule
Type: ScheduleTrigger
Lifecycle: active
Cron: 0 6 * * MON-FRI
Timezone: America/New_York
Fire count: 1,423
Error count: 0
Last fired: 2024-06-19T06:00:00Z
Workflow params: {"market": "US"}
```

### volnux workflow run
Execute a workflow manually.

```bash
volnux workflow run data_processing
```

Options:

| Option | Description |
| :--- | :--- |
| `--params` | JSON string of workflow parameters |
| `--params-file` | Path to JSON file of parameters |
| `--async` | Fire and forget — don't wait for completion |
| `--timeout` | Maximum execution time in seconds |

Development vs production:
* **Development**: Manual trigger is implicit. `volnux workflow run` always works.
* **Production**: Manual trigger must be explicitly registered in `ready()`. Without it, manual execution is rejected.

### volnux workflow status
Check the status of a running or completed workflow.

```bash
volnux workflow status data_processing
```

Output:
```text
Workflow: data_processing
Status: COMPLETED
Execution ID: exec-def-456
Started: 2024-06-19T14:30:00Z
Completed: 2024-06-19T14:30:45Z
Duration: 45.2s
Events: 3/3 completed
Current event: -
```

For a running workflow:
```text
Workflow: trade-reconciliation
Status: PAUSED
Execution ID: exec-abc-123
Started: 2024-06-19T14:00:00Z
Current event: ValidateTrade (phase: PROCESSING, 67% complete)
Paused at: 2024-06-19T14:32:00Z
Resources held: 0 (fully released)
```

### volnux workflow pause
Pause a running workflow at the next event boundary.

```bash
volnux workflow pause trade-reconciliation
```

The current event completes its current phase, checkpoints, and releases all resources. The workflow waits until resumed.

### volnux workflow resume
Resume a paused workflow.

```bash
volnux workflow resume trade-reconciliation
```

The workflow resumes from the exact phase where it was paused. Resources are rehydrated from the checkpoint.

### volnux workflow cancel
Cancel a running workflow.

```bash
volnux workflow cancel trade-reconciliation --reason "System migration"
```

Options:

| Option | Description |
| :--- | :--- |
| `--reason` | Reason for cancellation (recorded in audit trail) |

### volnux workflow checkpoint
Force an immediate checkpoint of a running workflow.

```bash
volnux workflow checkpoint trade-reconciliation
```

The current event captures its full state immediately. The checkpoint is persisted synchronously. Confirmation is returned to the operator.

### volnux workflow priority
Change the priority of a running workflow.

```bash
volnux workflow priority trade-reconciliation --level high
```

Priority levels: `low`, `normal`, `high`, `critical`

Higher priority workflows get preferential access to executor slots. Lower priority workflows may be preempted to make room.

### volnux mesh nodes
View P2P mesh topology and node status.

```bash
volnux mesh nodes
```

Output:
```text
NODE                    STATUS    SUB-NETWORK    LOAD    UPTIME
node-1.internal         active    us-east        45%     14d 3h
node-2.internal         active    us-east        62%     14d 3h
node-3.internal         active    us-west        28%     7d 12h
bridge-1.internal       active    global         12%     30d 1h
bridge-2.internal       active    global         15%     30d 1h
bridge-3.internal       active    global         10%     30d 1h
```

### volnux audit query
Query the audit trail.

```bash
volnux audit query --workflow trade-reconciliation --since 2024-06-01
```

Options:

| Option | Description |
| :--- | :--- |
| `--workflow` | Filter by workflow name |
| `--event` | Filter by event name |
| `--action` | Filter by action type |
| `--actor` | Filter by user |
| `--status` | Filter by status: success, failure, cancelled |
| `--since` | Start of time range (ISO 8601) |
| `--until` | End of time range (ISO 8601) |
| `--limit` | Maximum results |
| `--format` | Output format: table or json |

Output:
```text
TIMESTAMP            ACTOR           ACTION                  WORKFLOW              STATUS
2024-06-19T06:00Z    system          workflow.started        trade-reconciliation  -
2024-06-19T06:00Z    system          event.executed          trade-reconciliation  success
2024-06-19T06:05Z    system          event.executed          trade-reconciliation  success
2024-06-19T06:10Z    alice@ex.com    hitl.responded          trade-reconciliation  approved
2024-06-19T06:10Z    system          workflow.completed      trade-reconciliation  success
```

### volnux hitl list
List pending human-in-the-loop requests.

```bash
volnux hitl list
```

Output:
```text
REQUEST ID    WORKFLOW              TITLE                    CREATED              TIMEOUT
hitl-001      trade-reconciliation  Review Large Trade       2024-06-19T06:05Z   4h
hitl-002      compliance-check      Approve Data Export     2024-06-19T05:30Z   2h
```

### volnux hitl respond
Respond to a pending HITL request from the CLI.

```bash
volnux hitl respond hitl-001 --decision Approve --comment "Trade looks good"
```

Options:

| Option | Description |
| :--- | :--- |
| `--decision` | Response value (must match configured options) |
| `--comment` | Optional comment for the audit trail |

### volnux version
Display the installed Volnux version.

```bash
volnux --version
```

Output:
```text
volnux 2.0.0
```

### volnux help
Display help for any command.

```bash
volnux --help
volnux workflow --help
volnux workflow run --help
```
