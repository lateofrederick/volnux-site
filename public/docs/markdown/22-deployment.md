Volnux scales from a single Python process on a laptop to a multi-node cluster spanning data centers. The same workflow code runs in every environment. The deployment configuration changes; the events and Pointy-Lang files don't.

## Local Development
Local development requires nothing beyond `pip install volnux`. The SQLite backend handles trigger state. The async executor runs workflows in-process. No external services needed.

Setup:
```bash
pip install volnux
volnux init my_project
cd my_project
volnux workflow init hello_world
volnux dev
```

What runs:
* Volnux engine in the current process
* All triggers active (schedule triggers fire, event triggers listen)
* REST API on localhost:8080
* Web dashboard on localhost:8080/dashboard
* File watchers reload on code changes
* Checkpointing disabled by default (enable in `config.py` for testing durability)

Configuration:
```python
# config.py
PROJECT_NAME = "my_project"
VERSION = "0.1.0"

# Enable checkpointing for durability testing
PROJECT_CHECKPOINTING = True
CHECKPOINT_BACKEND = "sqlite"  # Local SQLite for development
```

## Single-Node Production
A single-node production deployment runs the full Volnux runtime on one machine. Suitable for moderate workloads, team-level deployment, or staging environments.

Architecture:

```d2
direction: down

SingleNode: Single Node {
  direction: down
  
  VolnuxRuntime: Volnux Runtime {
    direction: down
    TE: TriggerEngine
    WE: WorkflowEngine
    CM: CheckpointManager
    HM: HealthMonitor
    RM: ResourceMonitor
    RehydM: RehydrationManager
    RemM: RemoteManager
    API: REST API
  }
  
  Persistence: Persistence {
    direction: right
    PG: PostgreSQL\nGovernance { shape: cylinder }
    Redis: Redis\nCheckpoints/HITL { shape: cylinder }
    SQLite: SQLite\nTrigger State { shape: cylinder }
  }
  
  VolnuxRuntime -> Persistence
}
```

Setup:
```bash
# Install with production dependencies
pip install "volnux[postgres,redis]"

# Configure persistence
cat > config.py << EOF
from pathlib import Path

PROJECT_DIR = Path(__file__).parent
PROJECT_NAME = 'my_project'
VERSION = '1.0.0'

PROJECT_CHECKPOINTING = True

POSTGRES_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "database": "volnux",
    "username": "volnux",
    "password": "${PG_PASSWORD}",
}

REDIS_CONFIG = {
    "host": "localhost",
    "port": 6379,
    "db": 0,
}
EOF

# Run database migrations
volnux migrate up

# Start the engine
volnux serve --host 0.0.0.0 --port 8080
```

Process management (systemd):
```ini
# /etc/systemd/system/volnux.service
[Unit]
Description=Volnux Workflow Engine
After=network.target postgresql.service redis.service

[Service]
Type=simple
User=volnux
WorkingDirectory=/opt/volnux/my_project
ExecStart=/opt/volnux/venv/bin/volnux serve --host 0.0.0.0 --port 8080
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Resource sizing guidelines:

| Workload | CPU | Memory | PostgreSQL | Redis |
| :--- | :--- | :--- | :--- | :--- |
| Light (< 100 workflows/day) | 2 cores | 2 GB | 2 vCPU, 4 GB | 1 GB |
| Medium (< 1000 workflows/day) | 4 cores | 4 GB | 4 vCPU, 8 GB | 2 GB |
| Heavy (< 10000 workflows/day) | 8 cores | 8 GB | 8 vCPU, 16 GB | 4 GB |

## Multi-Node with Celery
Distribute workflow execution across Celery workers. The engine schedules workflows; Celery workers execute them.

Architecture:

```d2
direction: down

SchedulerNode: Scheduler Node {
  direction: down
  TE: TriggerEngine
  WE: WorkflowEngine\nscheduling only
  CE: CeleryWorkflowExecutor
  API: REST API
}

Workers: Celery Workers {
  direction: down
  W1: Celery Worker 1
  W2: Celery Worker 2
}

SharedInfrastructure: Shared Infrastructure {
  direction: right
  PG: PostgreSQL\nGovernance { shape: cylinder }
  Redis: Redis\nBroker/Checkpoints/HITL { shape: cylinder }
}

SchedulerNode.CE -> SharedInfrastructure.Redis: Schedule
SharedInfrastructure.Redis -> Workers: Consume
Workers -> SharedInfrastructure: State
SchedulerNode -> SharedInfrastructure: State
```

Scheduler node configuration:
```python
# config.py
from volnux.executors import CeleryWorkflowExecutor

def ready(self):
    self.executor = CeleryWorkflowExecutor(
        registry=self._workflow_registry,
        broker_url="redis://redis.internal:6379/0",
        queue="volnux_workflows",
        task_soft_time_limit=3600,
    )
```

Worker node setup:
```bash
# Install with Celery support
pip install "volnux[postgres,redis,celery]"

# Start Celery worker
celery -A volnux.worker worker \
    --loglevel=info \
    --concurrency=8 \
    --queues=volnux_workflows
```

Scaling:
* Add workers horizontally: `celery -A volnux.worker worker --concurrency=8`
* Autoscale based on queue depth: `--autoscale=16,4`
* Separate queues for priority: `--queues=volnux_high,volnux_default,volnux_low`

## Kubernetes Deployment
Run Volnux on Kubernetes for containerised deployment with auto-scaling, resource limits, and rolling updates.

Architecture:

```d2
direction: down

KubernetesCluster: Kubernetes Cluster {
  direction: down
  
  APIDeployment: API Deployment {
    direction: down
    API: REST API
    TE: TriggerEngine
    Dash: Dashboard
  }
  
  WorkerDeployment: Worker Deployment {
    direction: down
    WE: Workflow exec
    EP: Event pool
    CM: CheckpointMgr
  }
  
  APIDeployment -> APIDeployment: Scale: 2 Replicas { style.stroke-dasharray: 5 }
  WorkerDeployment -> WorkerDeployment: Scale: 3-10 Replicas { style.stroke-dasharray: 5 }
}

ExternalServices: External Services {
  direction: right
  PG: PostgreSQL\nGovernance { shape: cylinder }
  Redis: Redis\nBroker/Checkpoints/HITL { shape: cylinder }
}

KubernetesCluster -> ExternalServices
```

API Deployment:
```yaml
# kubernetes/api-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: volnux-api
spec:
  replicas: 2
  selector:
    matchLabels:
      app: volnux-api
  template:
    metadata:
      labels:
        app: volnux-api
    spec:
      containers:
      - name: volnux
        image: volnux-engine:2.0.0
        ports:
        - containerPort: 8080
        env:
        - name: VOLNUX_POSTGRES_HOST
          valueFrom:
            secretKeyRef:
              name: volnux-secrets
              key: postgres-host
        - name: VOLNUX_REDIS_HOST
          value: redis-service
        resources:
          requests:
            cpu: "1"
            memory: "2Gi"
          limits:
            cpu: "2"
            memory: "4Gi"
---
apiVersion: v1
kind: Service
metadata:
  name: volnux-api
spec:
  selector:
    app: volnux-api
  ports:
  - port: 8080
    targetPort: 8080
```

Worker Deployment (using `KubernetesWorkflowExecutor`):
```yaml
# kubernetes/worker-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: volnux-worker
spec:
  replicas: 3
  selector:
    matchLabels:
      app: volnux-worker
  template:
    metadata:
      labels:
        app: volnux-worker
    spec:
      containers:
      - name: volnux-worker
        image: volnux-engine:2.0.0
        command: ["volnux", "worker"]
        env:
        - name: VOLNUX_POSTGRES_HOST
          valueFrom:
            secretKeyRef:
              name: volnux-secrets
              key: postgres-host
        - name: VOLNUX_REDIS_HOST
          value: redis-service
        resources:
          requests:
            cpu: "2"
            memory: "4Gi"
          limits:
            cpu: "4"
            memory: "8Gi"
```

Or use `KubernetesWorkflowExecutor` for per-workflow Jobs:
```python
def ready(self):
    self.executor = KubernetesWorkflowExecutor(
        registry=self._workflow_registry,
        namespace="volnux-workflows",
        image="volnux-engine:2.0.0",
        resource_limits={"cpu": "2", "memory": "4Gi"},
        ttl_seconds_after_finished=3600,
    )
```

Each workflow execution creates a Kubernetes Job. The Job runs in its own pod with its own resource allocation. Completed Jobs are cleaned up after one hour.

Horizontal Pod Autoscaling:
```yaml
# kubernetes/worker-hpa.yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: volnux-worker
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: volnux-worker
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## P2P Mesh Deployment (Future)
The P2P mesh enables fully decentralized deployment with no central scheduler, no message broker, and no shared database for operational state. Nodes discover each other, route tasks, and coordinate through Raft consensus.

Architecture:

```d2
direction: down

GlobalLayer: Global Layer {
  direction: right
  B1: Bridge 1 (Raft)
  B2: Bridge 2 (Raft)
  B3: Bridge 3 (Raft)
  B1 -> B2 { style.stroke-dasharray: 5 }
  B2 -> B3 { style.stroke-dasharray: 5 }
  B3 -> B1 { style.stroke-dasharray: 5 }
}

SubNetworkEast: Sub-Network us-east {
  LREast: Local Raft\n≤2000 nodes
}

SubNetworkWest: Sub-Network us-west {
  LRWest: Local Raft\n≤2000 nodes
}

SubNetworkEU: Sub-Network eu-west {
  LREU: Local Raft\n≤2000 nodes
}

GlobalLayer -> SubNetworkEast
GlobalLayer -> SubNetworkWest
GlobalLayer -> SubNetworkEU
```

Node types:

| Node Type | Count | Purpose |
| :--- | :--- | :--- |
| Bridge | 3 per cluster | Cross-network routing, global state |
| Worker | Up to 2000 per sub-network | Execute workflows and events |
| API | 1-3 per sub-network | REST API, dashboard |

Socket efficiency:

| Node Type | Sockets |
| :--- | :--- |
| Worker | ~5-9 (1 listener + 3 Raft + 1-5 active connections) |
| Bridge | ~503 per bridge (1 listener + 2 Raft peers + 1 per active sub-network) |

A million-node cluster across 500 sub-networks requires only ~9 sockets per worker node and ~503 sockets per bridge node. All well within Linux limits.

Current status: Remote executors with static host configuration are implemented and working (gRPC, XML-RPC, TCP). The P2P mesh service discovery and routing layer is in active design. Deploy with static configuration today; migrate to mesh discovery when available. The executor abstraction isolates the transport from the workflow code — no changes needed to your events or Pointy-Lang files.
