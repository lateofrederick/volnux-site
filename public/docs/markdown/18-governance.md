Governance is not a feature in Volnux. It is the foundation. Every design decision — from the static Pointy-Lang graph to the `ForeignKeyField` with `OnDelete.PROTECT` — exists to make workflows auditable, controllable, and provably correct. This section covers the governance models, policies, and mechanisms that make Volnux suitable for regulated industries.

## The Governance Philosophy
Volnux was built on four governance claims, each backed by concrete architecture:

**Readable by design.** Pointy-Lang is the workflow. What you read is what executes. A compliance officer can review a `.pty` file without understanding Python. The static graph shows every possible execution path before anything runs.

**Auditable by default.** Every execution produces a complete OpenTelemetry trace. Every event is versioned. Every state transition is checkpointed. Every human decision is recorded. The audit trail is a full replay-capable execution record, not a log file.

**Interventable at every level.** Pause a running workflow. Reroute execution. Replay from a checkpoint with a patched event. The command channel gives operators control over running tasks, not just workflow definitions. Break-glass access enables emergency intervention with full audit recording.

**Composable without chaos.** Teams publish events to a private registry with versioned manifests. Other teams consume them by name. No shared codebases. No deployment coordination. No surprise dependency conflicts. The manifest enforces compatibility and deprecation timelines.

## AuditEntry (Append-Only)
Every significant action in Volnux creates an `AuditEntry` — an immutable, append-only record stored in PostgreSQL.

```python
class AuditEntry(GovernanceModel):
    timestamp: float
    actor: str                    # User, system, or service account
    action: str                   # What happened
    resource_type: str            # Workflow, Event, Trigger, etc.
    resource_id: str              # Specific resource identifier
    details: Dict[str, Any]       # Action-specific metadata
    workflow_id: Optional[str]
    execution_id: Optional[str]
    trace_id: Optional[str]       # Links to OTel trace
```

Actions recorded:

| Action | When |
| :--- | :--- |
| `workflow.created` | New workflow registered |
| `workflow.started` | Execution begins |
| `workflow.completed` | Execution ends |
| `workflow.failed` | Execution fails |
| `workflow.paused` | Operator pauses workflow |
| `workflow.resumed` | Operator resumes workflow |
| `workflow.cancelled` | Operator cancels workflow |
| `event.executed` | Event completes |
| `event.retried` | Event retry occurs |
| `event.bypassed` | Event skipped via bypass |
| `trigger.registered` | New trigger added |
| `trigger.paused` | Trigger paused |
| `hitl.requested` | Human input requested |
| `hitl.responded` | Human provides response |
| `hitl.timeout` | HITL request expires |
| `break_glass.invoked` | Emergency access used |
| `delegation.created` | Authority delegated |
| `delegation.revoked` | Delegation revoked |
| `source.registered` | Event source added |
| `manifest.published` | Package published to EventHub |

Querying the audit trail:

```bash
# All actions by a user
volnux audit query --actor alice@example.com

# All actions on a workflow
volnux audit query --workflow trade-reconciliation

# All break-glass invocations
volnux audit query --action break_glass.invoked

# Actions in a time range
volnux audit query --since 2024-06-01 --until 2024-06-19
```

Audit entries are created by the framework, not by event authors. The event author writes business logic. The framework records what happened. The audit trail cannot be tampered with by application code.

## ApprovalChain and ApprovalStep
For workflows requiring multi-step human approval, `ApprovalChain` defines the policy:

```python
class ApprovalChain(GovernanceModel):
    name: str
    workflow: ForeignKeyField[Workflow, FKConfig(on_delete=OnDelete.CASCADE)]
    steps: List[ApprovalStep]
    require_all_steps: bool = True  # All must approve, or any one suffices
    timeout_hours: Optional[float] = None  # Chain-level timeout

class ApprovalStep(GovernanceModel):
    chain: ForeignKeyField[ApprovalChain, FKConfig(on_delete=OnDelete.CASCADE)]
    order: int                        # Step sequence (1, 2, 3...)
    required_role: Optional[str]      # Role that can approve this step
    required_user: Optional[str]      # Specific user who must approve
    timeout_hours: Optional[float]    # Step-level timeout
    escalation_step: Optional[int]    # Escalate to this step on timeout
```

Example: Trade approval requiring manager then director:

```python
chain = ApprovalChain(
    name="large_trade_approval",
    require_all_steps=True,
    timeout_hours=72,
    steps=[
        ApprovalStep(order=1, required_role="manager", timeout_hours=24),
        ApprovalStep(order=2, required_role="director", timeout_hours=48),
    ],
)
```

The workflow requests approval at each step. The manager approves first. The director approves second. If the manager doesn't respond within 24 hours, the request escalates. Both approvals are recorded in the audit trail with timestamps, identities, and decisions.

## Delegation and DelegationAction
Delegation allows authority to be temporarily transferred with constraints:

```python
class Delegation(GovernanceModel):
    delegator: ForeignKeyField[User, FKConfig(on_delete=OnDelete.CASCADE)]
    delegate: ForeignKeyField[User, FKConfig(on_delete=OnDelete.CASCADE)]
    role: Optional[str]              # Role being delegated
    scope: Dict[str, Any]            # What the delegate can do
    valid_from: float                # Delegation start time
    valid_until: float               # Delegation expiry
    is_active: bool = True

class DelegationAction(GovernanceModel):
    delegation: ForeignKeyField[Delegation, FKConfig(on_delete=OnDelete.CASCADE)]
    action: str                      # What the delegate did
    timestamp: float
    workflow_id: Optional[str]
    details: Dict[str, Any]
```

The policy/action split: `Delegation` defines what CAN be delegated. `DelegationAction` records what WAS actually delegated. An auditor can see both the policy and every time it was invoked.

Example: Director delegates trade approval while on leave:

```python
delegation = Delegation(
    delegator=director_user,
    delegate=senior_manager_user,
    role="director",
    scope={"workflows": ["trade-reconciliation"], "max_amount": 500000},
    valid_from=datetime(2024, 6, 1).timestamp(),
    valid_until=datetime(2024, 6, 15).timestamp(),
)
```

During the director's leave, the senior manager can approve trades up to $500,000. Each approval records a `DelegationAction` linking to this delegation. The audit trail shows: "Director was on leave. Senior Manager approved under delegated authority. The delegation was valid from June 1 to June 15."

## BreakGlassAccess and BreakGlassAction
Break-glass access enables emergency intervention when normal approval processes can't be followed:

```python
class BreakGlassAccess(GovernanceModel):
    user: ForeignKeyField[User, FKConfig(on_delete=OnDelete.CASCADE)]
    workflow: ForeignKeyField[Workflow, FKConfig(on_delete=OnDelete.CASCADE)]
    reason_required: bool = True
    max_duration_minutes: int = 30
    is_active: bool = True

class BreakGlassAction(GovernanceModel):
    access: ForeignKeyField[BreakGlassAccess, FKConfig(on_delete=OnDelete.CASCADE)]
    user: ForeignKeyField[User, FKConfig(on_delete=OnDelete.PROTECT)]
    action: str                      # What was done
    reason: str                      # Why it was done
    timestamp: float
    workflow_id: str
    execution_id: Optional[str]
    details: Dict[str, Any]
```

The policy/action split again: `BreakGlassAccess` defines who can break glass and under what conditions. `BreakGlassAction` records every time they actually did.

Example: Emergency trade cancellation during system outage:

```python
# Policy: Senior operators can break glass on trading workflows
access = BreakGlassAccess(
    user=senior_operator,
    workflow=trading_workflow,
    reason_required=True,
    max_duration_minutes=30,
)

# Action: Emergency cancellation
action = BreakGlassAction(
    access=access,
    user=senior_operator,
    action="workflow.cancelled",
    reason="System outage — trading must stop immediately. Confirmed by CTO.",
    workflow_id="trading-001",
)
```

The action is recorded permanently. The compliance officer reviews all break-glass invocations weekly. The operator had authority. The reason was documented. The action was time-limited. The audit trail is complete.

## RBAC — Users, Teams, Roles, Organisations
Volnux includes a full identity and access management model:

```python
class Organization(GovernanceModel):
    name: str
    slug: str                       # URL-safe identifier

class Team(GovernanceModel):
    name: str
    organization: ForeignKeyField[Organization, FKConfig(on_delete=OnDelete.CASCADE)]

class Role(GovernanceModel):
    name: str                       # "workflow_admin", "event_publisher", "auditor"
    permissions: List[str]          # Granular permission strings

class User(GovernanceModel):
    username: str
    email: str
    organization: ForeignKeyField[Organization, FKConfig(on_delete=OnDelete.CASCADE)]

class RoleAssignment(GovernanceModel):
    user: ForeignKeyField[User, FKConfig(on_delete=OnDelete.CASCADE)]
    role: ForeignKeyField[Role, FKConfig(on_delete=OnDelete.CASCADE)]
    scope: Dict[str, Any]           # Limited to specific workflows, teams, etc.

class TeamMember(GovernanceModel):
    user: ForeignKeyField[User, FKConfig(on_delete=OnDelete.CASCADE)]
    team: ForeignKeyField[Team, FKConfig(on_delete=OnDelete.CASCADE)]
```

Organization-scoped governance:
All governance models inherit organization scoping. Workflows in Organization A are invisible to users in Organization B. EventHub packages can be scoped to organizations. The `TriggerStateRecord` on a node only tracks triggers for that node's organization.

Permission examples:

| Permission | Allows |
| :--- | :--- |
| `workflow.run` | Execute workflows |
| `workflow.admin` | Create, edit, delete workflows |
| `workflow.pause` | Pause and resume running workflows |
| `trigger.manage` | Create, edit, pause triggers |
| `event.publish` | Publish to EventHub |
| `event.consume` | Register sources from EventHub |
| `audit.read` | Query the audit trail |
| `break_glass.invoke` | Use emergency access |
| `delegation.create` | Delegate authority |
| `mesh.admin` | Manage P2P mesh configuration |

## The volnux.manifest.json
The manifest is the machine-validated contract between event publishers and consumers. It's generated by the CLI, not hand-written.

### Event Project Manifest
```json
{
    "$schema": "https://eventhub.volnux.dev/manifest/v1.json",
    "manifest_version": "1",
    "package": {
        "name": "trading-events",
        "version": "2.1.0",
        "package_type": "event",
        "description": "Trading event library for market data processing",
        "author": "trading-team",
        "license": "Proprietary",
        "source": {
            "type": "hub",
            "package": "trading-events",
            "version": "2.1.0"
        }
    },
    "events": [
        {
            "class": "CalculateRisk",
            "module": "trading_events.risk",
            "name": "calculate_risk",
            "version": "1.3.0",
            "categories": ["ANALYZE"],
            "deprecated": false,
            "init_params": {
                "confidence": {
                    "type": "float",
                    "required": false,
                    "description": "Confidence level for VaR calculation",
                    "default": 0.95
                }
            }
        }
    ],
    "changelog": {
        "2.1.0": {
            "date": "2024-06-15",
            "type": "feature",
            "entries": ["Added CalculateRisk event", "Updated dependency versions"]
        }
    },
    "dependencies": {
        "numpy": ">=1.24.0",
        "market-data-lib": ">=3.0,<4.0"
    },
    "compatibility": {
        "volnux": ["2.0.x"],
        "python": ["3.11", "3.12"]
    }
}
```

### Workflow Project Manifest
```json
{
    "$schema": "https://eventhub.volnux.dev/manifest/v1.json",
    "manifest_version": "1",
    "package": {
        "name": "trade-reconciliation",
        "version": "2.1.0",
        "package_type": "workflow",
        "description": "End-of-day trade reconciliation workflow",
        "author": "compliance-team",
        "license": "Proprietary",
        "source": {
            "type": "hub",
            "package": "trade-reconciliation",
            "version": "2.1.0"
        }
    },
    "workflows": [
        {
            "name": "trading",
            "class": "TradingConfig",
            "version": "2.0.0",
            "mode": "CFG",
            "pipeline": {
                "class": "TradingPipeline",
                "module": "workflows.trading.pipeline",
                "input_fields": {
                    "market": {
                        "data_type": "str",
                        "required": true,
                        "description": "Market identifier"
                    }
                }
            },
            "sources": [
                {
                    "name": "trading-events",
                    "source_type": "hub",
                    "version": ">=2.1.0"
                }
            ],
            "triggers": [
                {
                    "trigger_type": "schedule",
                    "config": {"cron": "0 6 * * MON-FRI"}
                }
            ],
            "pointy_lang_file": "trading.ptl"
        }
    ],
    "dependencies": {
        "trading-events": ">=2.1.0",
        "notification-events": ">=1.5.0"
    },
    "compatibility": {
        "volnux": ["2.0.x"],
        "python": ["3.11", "3.12"]
    }
}
```

### Manifest Validation Schema
The manifest is validated against a JSON Schema at publish time and at consumption time. The schema enforces:
* **Package identity**: Name follows PyPI conventions. Version is valid semver.
* **Event contracts**: Every event declares its class, module, version, and init parameters with types.
* **Deprecation lifecycle**: If `deprecated: true`, `deprecation_info` is required with `since_version`, `reason`, `replacement`, and `removal_version`.
* **Compatibility matrix**: Publisher declares tested Volnux and Python versions.
* **Dependencies**: PEP 440 version specifiers for all runtime dependencies.
* **Changelog**: Structured, version-keyed, with date, type, and entries.

## Deprecation Lifecycle
Events and workflows have a structured deprecation lifecycle:

```json
{
    "deprecated": true,
    "deprecation_info": {
        "since_version": "2.1.0",
        "reason": "Replaced by CalculateRiskV2 which supports multi-asset portfolios",
        "replacement": "CalculateRiskV2",
        "removal_version": "3.0.0"
    }
}
```

Timeline:
* **v2.0.0**: `CalculateRisk` is active.
* **v2.1.0**: `CalculateRisk` is deprecated. Consumers get warnings. The replacement `CalculateRiskV2` is available.
* **v2.x.x**: Both events coexist. Consumers migrate on their own schedule.
* **v3.0.0**: `CalculateRisk` is removed. Workflows still depending on it fail at initialization with a clear error: "Event 'CalculateRisk' was removed in v3.0.0. Use 'CalculateRiskV2'."

The deprecation timeline is machine-enforced. The manifest schema requires `removal_version` to be a specific semver. The EventHub registry rejects packages that remove events before their declared removal version. Consumers get warnings at every step: at source registration, at workflow validation, and at execution.

## Version Pinning and Compatibility
Consumers pin to specific versions or ranges:

```python
# Exact version
WorkflowSource(version="==2.1.0")

# Compatible range
WorkflowSource(version=">=2.1.0,<3.0.0")

# Minimum version
WorkflowSource(version=">=2.1.0")
```

The dependency resolver checks compatibility at initialization time. If a workflow requires `trading-events>=2.1.0` but the registry only has `2.0.0`, the workflow fails to load with a clear error. If a workflow requires `trading-events==2.1.0` but `2.2.0` introduces a breaking change to an event signature, the workflow continues using `2.1.0` — the pinned version is respected.

Compatibility matrix:
The manifest's compatibility section declares tested versions:

```json
"compatibility": {
    "volnux": ["2.0.x"],
    "python": ["3.11", "3.12"]
}
```

If a consumer runs Volnux 2.1.0 and the package only declares compatibility with 2.0.x, the consumer gets a warning: "This package has not been tested with your Volnux version." The workflow can still run (unless `strict_mode` is enabled), but the operator is informed of the risk.

This is governance through transparency. Every dependency is explicit. Every version is pinned. Every deprecation is scheduled. Every compatibility claim is verifiable. The auditor knows exactly what code ran, where it came from, and whether it was approved for use.
