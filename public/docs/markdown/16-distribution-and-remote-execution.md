Volnux workflows can span multiple machines, data centers, and cloud regions. The distribution layer enables this without a centralized scheduler, without a master node, and without changing how events are written. An event that runs locally today can run on a remote node tomorrow — change one annotation in Pointy-Lang.

## Remote Executors
Remote executors dispatch events to other machines for execution. They package the event's name and parameters, send them over the network, wait for the result, and return it to the workflow engine.

### GRPCExecutor
The gRPC executor uses Protocol Buffers for serialization and HTTP/2 for transport. It's the recommended executor for production deployments.

```pointy
CalculateRisk[
    executor="GRPCExecutor",
    executor_config={
        "host": "risk-engine.internal",
        "port": 45545,
        "tls": true,
        "timeout": 30.0
    }
]
```

Configuration:

| Parameter | Description | Default |
| :--- | :--- | :--- |
| `host` | Remote node hostname or IP | Required |
| `port` | Remote manager port | 45545 |
| `tls` | Enable TLS encryption | false |
| `timeout` | RPC timeout in seconds | 60.0 |
| `retry_count` | Retries on transient failure | 0 |

How it works:
* The `GRPCExecutor` serializes the event name, parameters, and execution context using protobuf.
* It opens a gRPC stream to the remote host.
* The remote `RemoteManager` receives the request, instantiates the event, executes it, and streams the result back.
* The executor deserializes the result and returns it to the workflow engine.
* The OTel trace context propagates across the gRPC boundary — the remote execution appears as a child span in the workflow trace.

### XMLRPCExecutor
The XML-RPC executor uses XML for serialization and HTTP for transport. It's useful for environments where gRPC is not available or where firewalls restrict non-HTTP traffic.

```pointy
FetchPrices[
    executor="XMLRPCExecutor",
    executor_config={
        "host": "data-node.internal",
        "port": 8080,
        "path": "/volnux/execute"
    }
]
```

XML-RPC is simpler than gRPC — no protobuf compilation step, no HTTP/2 requirement. The tradeoff is lower performance for large payloads and less efficient serialization.

### TCPExecutor
The TCP executor uses a simple TCP socket with JSON serialization. It's useful for debugging, testing, and environments where protocol dependencies should be minimal.

```pointy
SimpleTask[
    executor="TCPExecutor",
    executor_config={
        "host": "localhost",
        "port": 9999
    }
]
```

Raw TCP is the fallback — no dependencies beyond Python's standard library. It's not recommended for production (no built-in encryption, no streaming, no authentication beyond the socket connection), but it's invaluable for development and testing.

## Remote Managers
Every Volnux node can run a `RemoteManager` — a server that listens for incoming execution requests from remote executors.

```python
from volnux.distribution import RemoteManager, GRPCRemoteManager

# Start a gRPC manager on port 45545
manager = GRPCRemoteManager(
    port=45545,
    tls_cert="/etc/volnux/cert.pem",
    tls_key="/etc/volnux/key.pem",
)
await manager.start()
```

What the manager does:
* Listens for incoming execution requests on the configured protocol and port.
* Receives a task — event name, parameters, execution context.
* Looks up the event in the local workflow registry.
* Instantiates the event with the provided parameters.
* Executes the event through the full lifecycle — checkpointing, retry, command channel.
* Returns the result to the caller.
* The event's execution trace is recorded locally. The OTel span is a child of the caller's span.

Protocol support:

| Manager | Protocol | Use Case |
| :--- | :--- | :--- |
| `GRPCRemoteManager` | gRPC | Production, high performance |
| `XMLRPCRemoteManager` | XML-RPC | Legacy systems, HTTP-only environments |
| `TCPRemoteManager` | TCP + JSON | Development, testing |

Multiple managers can run on the same node — one per protocol, on different ports.

## Deferred Tasks
A deferred task is an event that is not defined locally. It exists only as a name in a Pointy-Lang file. The actual event class is on another node.

```pointy
# This workflow runs on Node A
# These events are defined locally
LoadData -> ValidateTrades ->

# This event is on Node B — a deferred task
CalculateRisk[
    executor="GRPCExecutor",
    executor_config={"host": "risk-node.internal", "port": 45545}
] ->

# Back to local
GenerateReport
```

The lifecycle of a deferred task:
* **Parse time**: The Pointy-Lang compiler sees `CalculateRisk` with a remote executor annotation. It creates a deferred task node in the graph. No local event class is needed.
* **Validation**: The compiler validates what it can locally — the syntax, the graph structure, the annotations. It defers event resolution to runtime.
* **Runtime**: When the workflow engine reaches the deferred task node, the `GRPCExecutor` connects to `risk-node.internal:45545`.
* **Remote execution**: The remote node's `RemoteManager` receives the request, looks up `CalculateRisk` in its local registry, executes it, and returns the result.
* **Continuation**: The workflow engine receives the result and continues to `GenerateReport` on Node A.

The workflow spans nodes transparently:
* The `ExecutionContext` chain on Node A includes the deferred task — it records which node executed it, when, and what the result was.
* The OTel trace propagates across the gRPC boundary — the remote execution is a child span in the same trace.
* The audit trail shows the full execution, including the cross-node hop.
* If the remote execution fails, the error propagates back to Node A. The event's retry policy applies. The workflow can branch to error handling.

Deferred tasks enable:
* **Specialized hardware**: Route GPU-intensive events to GPU nodes. Route high-memory events to memory-optimized nodes. Route Rust events to nodes with the Rust runtime.
* **Data locality**: Process data where it lives. Route events to the node closest to the database.
* **Organizational boundaries**: Team A publishes events to their node. Team B references them as deferred tasks without sharing code. The EventHub manifest declares the contract. The runtime enforces it.
* **Legacy system integration**: Wrap a legacy service as a deferred task. The Pointy-Lang file references it. The executor calls the legacy API. The workflow continues.

## The P2P Mesh (Design Overview)
The P2P mesh is the discovery and routing layer on top of remote executors. It replaces hardcoded hostnames and ports with service discovery, load-aware routing, and failure handling.

> [!NOTE]
> Current state: Remote executors with static host configuration are implemented and working (gRPC, XML-RPC, TCP). The P2P mesh is in active design.

### Hierarchical Routing
The mesh uses a two-tier hierarchical architecture inspired by internet routing (BGP):

```text
Global Layer: Bridge Nodes (3-node Raft cluster)
              Maintain: inter-network routing table
              Know: which sub-network owns which node/task

Sub-network Layer: ≤2000 nodes per sub-network
                   Local Raft cluster for routing
                   On-demand direct sockets for data transfer
                   Self-organizes at 2000 node limit
```

Why hierarchical:
A full mesh (every node connects to every other) would require O(n²) sockets. For 1000 nodes, that's ~2000 sockets per node — exceeding Linux's default ulimit. For a million-node cluster, it's architecturally impossible.

The hierarchical design means:
* Worker nodes: ~5-9 sockets each
* Bridge nodes: ~503 sockets each (for 500 sub-networks)
* All well within Linux limits

### Bridge Nodes
Bridge nodes form a 3-node Raft cluster at the global layer. They maintain the inter-network routing table — which sub-network owns which tasks.

Intra-network resolution (no bridge involvement):
* Check local routing cache (TTL: 60s).
* Hit → open direct socket to target node.
* Miss → query local Raft cluster → update cache → direct socket.

Cross-network resolution (bridge queried):
* Check local routing cache.
* Miss → query local Raft → not found → query bridge nodes.
* Bridge resolves sub-network → update cache (TTL: 15s).
* Open direct socket across network boundary.

Bridge nodes are in the resolution path, never in the data path. They tell you where to go. They don't relay your data.

### Sub-Networks
Sub-networks are self-organizing groups of up to 2000 nodes. Each sub-network runs a local Raft cluster for routing.

Self-organization at capacity:
When node 2001 joins a full sub-network:
* Local cluster detects capacity reached.
* New sub-network created.
* New local Raft cluster initialized.
* Bridge nodes updated.
* Node 2001 registered in new sub-network.

No operator intervention. The mesh grows organically.

Failure handling:
* **Bridge node failure (2 of 3)**: Cached routes (TTL 15s) continue working. No new cross-network resolution until quorum restored. Stale-while-revalidate for existing routes.
* **Sub-network partition**: Local routing continues within the partition. Cross-partition tasks fail until the partition heals.
* **Node failure**: Remote executors retry on alternative nodes (if configured). The `HealthMonitor` restarts the local engine. Pending checkpoints are recovered from the persistence backend.

## Workflow Executors
Workflow executors are the Level 1 dispatchers — they determine where an entire workflow runs, not just individual events.

| Executor | Where It Runs | Use Case |
| :--- | :--- | :--- |
| `AsyncTaskWorkflowExecutor` | In-process as coroutine | Development, single-node, I/O-bound workflows |
| `ProcessWorkflowExecutor` | Child process | Process isolation, memory limits, timeouts |
| `CeleryWorkflowExecutor` | Celery task queue | Distributed workers, existing Celery infrastructure |
| `KubernetesWorkflowExecutor` | Kubernetes Job | Containerized deployment, resource limits, scaling |
| `RemoteMeshExecutor` | P2P mesh node | Full mesh routing, service discovery (future) |

Configuration:

```python
def ready(self):
    # Development — in-process
    self.executor = AsyncTaskWorkflowExecutor(
        registry=self._workflow_registry,
        max_concurrent=10,
    )
    
    # Production — Kubernetes
    self.executor = KubernetesWorkflowExecutor(
        registry=self._workflow_registry,
        namespace="volnux-prod",
        image="volnux-engine:2.0.0",
        resource_limits={"cpu": "2", "memory": "4Gi"},
    )
```

The two-level dispatch:
* **Trigger → WorkflowExecutor**: The trigger fires. The executor dispatches the workflow to the appropriate runtime.
* **Workflow → EventExecutor**: Inside the workflow, each event dispatches to its declared executor — async, thread, process, Rust, Cython, or remote.

The workflow executor is a deployment concern. The event executor is an implementation concern. Both are pluggable. Both are configured in `ready()`. The workflow code doesn't change regardless of where it runs.
