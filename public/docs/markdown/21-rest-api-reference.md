The Volnux REST API provides programmatic access to all runtime management capabilities. It's built with FastAPI, uses JWT authentication, and produces OpenAPI documentation. The same API powers the runtime CLI, the web dashboard, and third-party integrations.

## Authentication
All API endpoints (except login) require a valid JWT access token.

### POST /api/v1/auth/login
Authenticate and receive tokens.

Request:
```json
{
    "username": "alice@example.com",
    "password": "your_password"
}
```

Response (200):
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 3600
}
```

Response (401):
```json
{
    "detail": "Invalid username or password"
}
```

### POST /api/v1/auth/refresh
Refresh an expired access token.

Request:
```json
{
    "refresh_token": "eyJhbGciOiJIUzI1NiIs..."
}
```

Response (200):
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIs...",
    "token_type": "bearer",
    "expires_in": 3600
}
```

### POST /api/v1/auth/logout
Invalidate the current session.

Headers: `Authorization: Bearer <access_token>`

Response (200):
```json
{
    "detail": "Successfully logged out"
}
```

## Trigger Endpoints

### GET /api/v1/triggers
List all triggers with their current status.

Headers: `Authorization: Bearer <access_token>`

Query Parameters:

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `workflow` | string | Filter by workflow name |
| `status` | string | Filter by status: active, paused, stopped |
| `limit` | integer | Maximum results (default 100) |
| `offset` | integer | Pagination offset |

Response (200):
```json
{
    "triggers": [
        {
            "id": "trigger-001",
            "workflow_name": "trade-reconciliation",
            "trigger_type": "schedule",
            "lifecycle": "active",
            "enabled": true,
            "fire_count": 1423,
            "error_count": 0,
            "last_fired": "2024-06-19T06:00:00Z",
            "config": {
                "cron": "0 6 * * MON-FRI",
                "timezone": "America/New_York"
            }
        }
    ],
    "total": 5,
    "limit": 100,
    "offset": 0
}
```

### GET /api/v1/triggers/{trigger_id}
Get details for a specific trigger.

Response (200):
```json
{
    "id": "trigger-001",
    "workflow_name": "trade-reconciliation",
    "trigger_type": "schedule",
    "lifecycle": "active",
    "enabled": true,
    "fire_count": 1423,
    "error_count": 0,
    "last_fired": "2024-06-19T06:00:00Z",
    "last_error": null,
    "config": {
        "cron": "0 6 * * MON-FRI",
        "timezone": "America/New_York"
    },
    "created_at": "2024-01-15T10:00:00Z",
    "updated_at": "2024-06-19T06:00:00Z"
}
```

Response (404):
```json
{
    "detail": "Trigger 'trigger-001' not found"
}
```

### POST /api/v1/triggers/{trigger_id}/pause
Pause an active trigger.

Response (200):
```json
{
    "id": "trigger-001",
    "lifecycle": "paused",
    "message": "Trigger paused successfully"
}
```

Response (409):
```json
{
    "detail": "Cannot pause trigger 'trigger-001': current lifecycle is 'stopped', expected 'active'"
}
```

### POST /api/v1/triggers/{trigger_id}/resume
Resume a paused trigger.

Response (200):
```json
{
    "id": "trigger-001",
    "lifecycle": "active",
    "message": "Trigger resumed successfully"
}
```

### POST /api/v1/triggers/{trigger_id}/stop
Stop a trigger entirely.

Response (200):
```json
{
    "id": "trigger-001",
    "lifecycle": "stopped",
    "message": "Trigger stopped successfully"
}
```

## Workflow Endpoints

### POST /api/v1/workflows/{name}/run
Execute a workflow.

Headers: `Authorization: Bearer <access_token>`

Request Body:
```json
{
    "params": {
        "market": "US",
        "symbols": ["AAPL", "GOOGL"]
    },
    "run_type": "single",
    "async": false,
    "timeout": 3600
}
```

| Field | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| `params` | object | Workflow parameters | `{}` |
| `run_type` | string | `single` or `batch` | `single` |
| `async` | boolean | Fire and forget | `false` |
| `timeout` | integer | Maximum seconds | `null` (no limit) |

Response (200) — synchronous:
```json
{
    "execution_id": "exec-def-456",
    "workflow": "data_processing",
    "status": "completed",
    "result": {"processed_items": ["APPLE", "BANANA", "ORANGE"]},
    "started_at": "2024-06-19T14:30:00Z",
    "completed_at": "2024-06-19T14:30:45Z",
    "duration_seconds": 45.2
}
```

Response (202) — async:
```json
{
    "execution_id": "exec-def-456",
    "workflow": "data_processing",
    "status": "running",
    "message": "Workflow started. Check status at /api/v1/workflows/data_processing/status/exec-def-456"
}
```

Response (400):
```json
{
    "detail": "Validation failed: field 'market' expected type 'str', got 'int'"
}
```

Response (403):
```json
{
    "detail": "Manual trigger not registered for workflow 'trade-reconciliation' in production mode"
}
```

### GET /api/v1/workflows/{name}/status
Get the current status of the latest workflow execution.

Query Parameters:

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `execution_id` | string | Specific execution to query |

Response (200):
```json
{
    "execution_id": "exec-def-456",
    "workflow": "data_processing",
    "status": "completed",
    "mode": "CFG",
    "version": "2.0.0",
    "started_at": "2024-06-19T14:30:00Z",
    "completed_at": "2024-06-19T14:30:45Z",
    "duration_seconds": 45.2,
    "events_total": 3,
    "events_completed": 3,
    "events_failed": 0,
    "current_event": null,
    "current_phase": null
}
```

For a running or paused workflow:
```json
{
    "execution_id": "exec-abc-123",
    "workflow": "trade-reconciliation",
    "status": "paused",
    "current_event": {
        "name": "ValidateTrade",
        "phase": "PROCESSING",
        "progress": "67%",
        "started_at": "2024-06-19T14:00:00Z"
    },
    "paused_at": "2024-06-19T14:32:00Z",
    "resources_held": 0
}
```

### POST /api/v1/workflows/{name}/pause
Pause a running workflow.

Request Body (optional):
```json
{
    "reason": "Scheduled maintenance"
}
```

Response (200):
```json
{
    "execution_id": "exec-abc-123",
    "status": "paused",
    "message": "Workflow paused at next event boundary",
    "paused_at": "2024-06-19T14:32:00Z"
}
```

### POST /api/v1/workflows/{name}/resume
Resume a paused workflow.

Response (200):
```json
{
    "execution_id": "exec-abc-123",
    "status": "running",
    "message": "Workflow resumed",
    "resumed_at": "2024-06-19T14:45:00Z"
}
```

### POST /api/v1/workflows/{name}/cancel
Cancel a running workflow.

Request Body:
```json
{
    "reason": "System migration — workflow superseded"
}
```

Response (200):
```json
{
    "execution_id": "exec-abc-123",
    "status": "cancelled",
    "message": "Workflow cancelled",
    "cancelled_at": "2024-06-19T14:50:00Z"
}
```

### POST /api/v1/workflows/{name}/checkpoint
Force an immediate checkpoint.

Response (200):
```json
{
    "execution_id": "exec-abc-123",
    "message": "Checkpoint created",
    "checkpoint_id": "ckpt-xyz-789",
    "timestamp": "2024-06-19T14:35:00Z"
}
```

### PUT /api/v1/workflows/{name}/priority
Change workflow priority.

Request Body:
```json
{
    "level": "high"
}
```

Response (200):
```json
{
    "execution_id": "exec-abc-123",
    "priority": "high",
    "message": "Priority updated"
}
```

### GET /api/v1/workflows
List all registered workflows.

Response (200):
```json
{
    "workflows": [
        {
            "name": "data_processing",
            "version": "2.0.0",
            "mode": "CFG",
            "events": ["LoadData", "ProcessData", "SaveData"],
            "triggers": ["manual"],
            "status": "ready"
        },
        {
            "name": "trade-reconciliation",
            "version": "2.1.0",
            "mode": "CFG",
            "events": ["CalculateVar", "RiskReport", "TradeValidator"],
            "triggers": ["schedule", "manual"],
            "status": "ready"
        }
    ],
    "total": 2
}
```

## Mesh Endpoints

### GET /api/v1/mesh/nodes
List all nodes in the P2P mesh.

Response (200):
```json
{
    "nodes": [
        {
            "id": "node-1",
            "hostname": "node-1.internal",
            "status": "active",
            "sub_network": "us-east",
            "load": 45.2,
            "uptime_seconds": 1209600,
            "executor_slots_total": 16,
            "executor_slots_available": 8,
            "last_heartbeat": "2024-06-19T14:55:00Z"
        }
    ],
    "total": 5,
    "bridge_nodes": [
        {
            "id": "bridge-1",
            "hostname": "bridge-1.internal",
            "status": "active",
            "raft_role": "leader"
        }
    ]
}
```

### GET /api/v1/mesh/topology
Get the mesh topology graph.

Response (200):
```json
{
    "sub_networks": [
        {
            "name": "us-east",
            "node_count": 3,
            "status": "healthy"
        },
        {
            "name": "us-west",
            "node_count": 2,
            "status": "healthy"
        }
    ],
    "cross_network_routes": [
        {"from": "us-east", "to": "us-west", "latency_ms": 45}
    ]
}
```

## Audit Endpoints

### GET /api/v1/audit
Query the audit trail.

Headers: `Authorization: Bearer <access_token>`

Query Parameters:

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `workflow` | string | Filter by workflow name |
| `event` | string | Filter by event name |
| `action` | string | Filter by action type |
| `actor` | string | Filter by user |
| `status` | string | `success`, `failure`, `cancelled` |
| `since` | string | ISO 8601 start time |
| `until` | string | ISO 8601 end time |
| `limit` | integer | Maximum results (default 100) |
| `offset` | integer | Pagination offset |

Response (200):
```json
{
    "entries": [
        {
            "id": "audit-001",
            "timestamp": "2024-06-19T06:00:00Z",
            "actor": "system",
            "action": "workflow.started",
            "resource_type": "Workflow",
            "resource_id": "trade-reconciliation",
            "workflow_id": "trade-reconciliation",
            "execution_id": "exec-def-456",
            "details": {
                "trigger": "schedule",
                "params": {"market": "US"}
            }
        }
    ],
    "total": 1423,
    "limit": 100,
    "offset": 0
}
```

### GET /api/v1/audit/{entry_id}
Get a specific audit entry.

Response (200):
```json
{
    "id": "audit-001",
    "timestamp": "2024-06-19T06:00:00Z",
    "actor": "system",
    "action": "workflow.started",
    "resource_type": "Workflow",
    "resource_id": "trade-reconciliation",
    "workflow_id": "trade-reconciliation",
    "execution_id": "exec-def-456",
    "trace_id": "0af7651916cd43dd8448eb211c80319c",
    "details": {
        "trigger": "schedule",
        "params": {"market": "US"},
        "workflow_version": "2.1.0"
    }
}
```

## Admin Endpoints

### GET /api/v1/health
Health check endpoint.

Response (200):
```json
{
    "status": "healthy",
    "version": "2.0.0",
    "uptime_seconds": 1209600,
    "components": {
        "engine": "healthy",
        "checkpoint_manager": "healthy",
        "trigger_engine": "healthy",
        "database": "healthy",
        "redis": "healthy"
    }
}
```

### GET /api/v1/stats
Runtime statistics.

Response (200):
```json
{
    "workflows": {
        "total": 5,
        "running": 1,
        "paused": 1,
        "completed_24h": 1423,
        "failed_24h": 12
    },
    "triggers": {
        "total": 8,
        "active": 6,
        "paused": 2
    },
    "executors": {
        "async": {"total": 100, "available": 85},
        "thread": {"total": 20, "available": 15},
        "process": {"total": 16, "available": 8}
    },
    "checkpoints": {
        "queue_depth": 3,
        "total_persisted_24h": 45600,
        "avg_write_ms": 2.3
    },
    "hitl": {
        "pending": 2,
        "responded_24h": 45,
        "timed_out_24h": 1
    },
    "mesh": {
        "nodes": 5,
        "active_connections": 12
    }
}
```

### GET /api/v1/docs
OpenAPI documentation (Swagger UI).

Redirects to the interactive API documentation generated by FastAPI. All endpoints, request schemas, and response schemas are documented and testable from the browser.

### GET /api/v1/openapi.json
OpenAPI schema (JSON format).

Machine-readable API specification for generating client libraries.
