Not every decision can be automated. Compliance reviews, data quality checks, exception handling — these require human judgment. Volnux's HITL architecture integrates human decisions into governed workflows without holding resources, blocking execution, or losing audit context.

## The HITL Pattern
The core pattern is simple: ask, suspend, resume, proceed.

Event: "I need a human to review this trade."
Framework: "Suspended. Resources released."
Human: "Approved." (hours later)
Framework: "Waking event. Here's the response."
Event: "Trade approved. Executing."

The event's code is linear. It asks for input. It receives the response. It processes it. The suspension between the ask and the response is handled entirely by the framework. The event author writes straight-line code.

## request_human_input() in communicate()
HITL requests belong in the `communicate()` phase — before computation, not during it.

```python
class ApproveTrade(EventBase):
    async def communicate(self, *args, **kwargs):
        await self.request_human_input(
            title="Review Large Trade",
            description=f"Trade {self.trade_id} for {self.amount} exceeds threshold.",
            payload={
                "trade_id": self.trade_id,
                "amount": self.amount,
                "counterparty": self.counterparty,
                "timestamp": self.timestamp,
            },
            options=["Approve", "Reject", "Escalate"],
            timeout_hours=4,
        )
    
    async def process(self, *args, **kwargs):
        # This runs AFTER the human responds — possibly hours later
        response = await self.previous_result.filter(type="hitl").first()
        decision = response.content.get("decision")
        
        if decision == "Approve":
            return True, self.execute_trade()
        elif decision == "Reject":
            return False, f"Trade {self.trade_id} rejected by {response.content['reviewer']}"
        else:
            return False, "Trade escalated for further review"
```

Parameters:

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `title` | `str` | Short summary shown in notification |
| `description` | `str` | Detailed context for the reviewer |
| `payload` | `dict` | Data the reviewer needs to make a decision |
| `options` | `list` | Allowed responses (buttons in Slack, options in web UI) |
| `timeout_hours` | `float`| How long before the request expires |

The one-wait constraint: An event can suspend only once per lifecycle. If you need multiple human approvals, compose them in the graph — create a separate event for each approval step.

```pointy
RequestManagerApproval -> RequestDirectorApproval -> ExecuteTrade
```

Each event suspends independently. The manager approves first. The director approves second. Each step is a separate event with its own checkpoint, audit trail, and timeout.

## Suspension and Resource Release
When `request_human_input()` is called:

* The event's state is captured — all variables bound to `self`, all registered resources.
* A `HITLSuspensionRequest` is raised. This is a control flow exception, not an error.
* The coordinator catches it and:
  * Checkpoints the event state (if checkpointing is enabled)
  * Enqueues a `HITLRequest` record in Redis
  * Releases the event's executor slot — zero resources held
  * Notifies the human via configured adapters (Slack, email, web UI)
* The workflow engine continues processing other events.
* The `RehydrationManager` watches for the human's response.

The event is not "paused." It's not "waiting." It's fully released. It consumes no memory, no CPU, no executor slot. A thousand events waiting for human approval consume approximately 50KB of Redis storage and zero system resources.

Contrast with Airflow sensors: In Airflow, a sensor waiting for an external condition holds a worker slot. A thousand waiting sensors occupy a thousand worker slots — memory, CPU, and connection overhead. Volnux's suspension model eliminates this entirely.

## HITLQueue and RehydrationManager
The HITL infrastructure has three components:

**HITLQueue** — Redis-backed queue of pending requests:
* Stores `HITLRequest` records with TTL matching the timeout
* Organised per workflow for namespace isolation
* Each request has a unique `request_id` and `response_channel`

**RehydrationManager** — The bootloader that wakes suspended events:
* Subscribes to HITL response channels via Redis pub/sub
* When a human responds, claims the request (distributed claim via `SET nx=True`)
* Loads the event's checkpoint snapshot from Redis
* Injects the human's response into `previous_result`
* Resumes the event via the coordinator

The `RehydrationManager` is a `TriggerBase` subclass — it inherits the trigger lifecycle, CLI visibility, and OTel instrumentation. You can view its status with `volnux triggers list`. You can pause it with `volnux triggers pause rehydration-manager` during maintenance windows (pending requests stay safely in Redis).

Distributed claim prevents double-wake:

```python
claimed = await redis.set(claim_key, "1", nx=True, ex=30)
if not claimed:
    return  # Another RehydrationManager is handling this
```

If multiple `RehydrationManager` instances are running (multi-node deployment), only one processes each response. The claim is atomic. The TTL prevents orphaned claims if a manager crashes mid-processing.

## Human Interface Adapters
Volnux ships with adapters for common communication channels:

**SlackAdapter**:
* Sends interactive messages with Approve/Reject buttons
* HMAC-verified callback endpoint
* Human clicks a button → Slack sends a webhook → Volnux receives the response

```python
def ready(self):
    self.register_hitl_adapter(SlackAdapter(
        webhook_url=os.environ["SLACK_WEBHOOK_URL"],
        channel="#compliance-reviews",
    ))
```

**EmailAdapter**:
* Sends HTML emails with action links
* Links point to Volnux REST API callback endpoint
* Human clicks "Approve" → browser sends POST → Volnux processes response

**WebhookAdapter**:
* Sends payload to a configurable URL
* Waits for a POST response on a callback channel
* Useful for integrating with existing approval systems

**VolnuxUIAdapter**:
* Native web UI review queue
* Integrated with Volnux's REST API
* No external service required

**CLIAdapter**:
* Displays pending reviews in the terminal
* `volnux hitl list` — see pending requests
* `volnux hitl approve <request_id>` — respond from the command line

Multiple adapters can be active simultaneously. A single HITL request can notify via Slack, email, and the web UI. The first response wins. The others are discarded.

## Timeout and Escalation
Every HITL request has a timeout. When a request expires:

* The `RehydrationManager` detects the timeout during its polling cycle
* Injects a timeout response into the event's `previous_result`:
```json
{"decision": "timeout", "reason": "Request exceeded 4 hour limit"}
```
* The event's `process()` handles the timeout like any other response:
```python
if decision == "timeout":
    return False, "Trade approval timed out — escalating"
```

Alternatively, escalate before timeout using Pointy-Lang conditional branching:

```pointy
RequestApproval (
    0 -> ExecuteTrade,           # Approved
    1 -> RejectTrade,            # Rejected
    2 -> EscalateToManager       # Timeout or error
)
```

The event returns `(False, "timeout")` and the engine routes to the escalation branch automatically.

## Cooperative Preemption
The command channel enables external control of running workflows. Combined with HITL, this enables cooperative preemption — pausing a workflow mid-execution, including during human approval.

Pause a workflow waiting for approval:

```bash
volnux workflow pause trade-approval
```

The workflow completes its current event, checkpoints, and releases all resources. The pending HITL request remains in Redis. When the workflow is resumed, it continues from where it left off — the HITL response may have arrived during the pause, or it may still be pending.

Cancel a pending approval:

```bash
volnux workflow cancel trade-approval
```

The HITL request is removed from Redis. The human is notified that the approval is no longer needed. The workflow transitions to a cancelled state.

Break-glass override: In emergencies, authorised operators can bypass the normal approval chain:

```bash
volnux workflow approve trade-approval --break-glass --reason "System outage — emergency override"
```

The approval is recorded as a `BreakGlassAction` in the audit trail. The workflow proceeds. The compliance officer reviews the override after the incident.
