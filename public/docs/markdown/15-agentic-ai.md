Volnux treats AI agents as governed events. An agent is not a separate abstraction — it's an `EventBase` subclass with a reasoning loop inside `process()`. This means agents inherit everything: checkpointing, command channel, HITL, resource management, retry policies, executor dispatch, and audit trails. The governance guarantees that apply to batch processing apply equally to agentic AI.

## AgentEventBase
`AgentEventBase` extends `EventBase` with agent-specific capabilities: LLM provider integration, tool execution, handoff management, and step-by-step reasoning.

```python
from volnux.agents import AgentEventBase, AgentAction, tool

class TradingAnalyst(AgentEventBase):
    # LLM configuration
    llm_provider = "anthropic"
    model = "claude-3-opus-20240229"
    temperature = 0.1
    max_reasoning_steps = 15

    # Declare available tools
    tools = [FetchMarketData, CalculateRisk, ExecuteTrade]

    # Declare permitted handoff targets
    permitted_handoffs = ["ComplianceReviewer", "SeniorTrader"]

    # Prompt versioning for auditability
    prompt_version = "1.2.0"
    
    async def process(self, *args, **kwargs):
        # The ReAct loop runs automatically
        # Override if you need custom reasoning logic
        return await self._run_agent_loop(**kwargs)
```

Key properties:
* **Governed tools**: Only tools declared in the `tools` list can be called. Calling an undeclared tool raises `ToolPermissionError` — a security event recorded in the audit trail.
* **Governed handoffs**: Only agents in `permitted_handoffs` can receive delegations. Handing off to an undeclared agent raises `ToolPermissionError`.
* **Step limit**: `max_reasoning_steps` caps API consumption. An agent cannot reason indefinitely.
* **Prompt versioning**: `prompt_version` is stamped into every reasoning step and the EventHub manifest. Auditors can trace which prompt produced which decision.

## The ReAct Loop
The ReAct (Reasoning + Acting) loop runs inside `process()`. The agent reasons, decides on an action, executes it, observes the result, and repeats.

```python
async def _run_agent_loop(self, **kwargs):
    # Initialize private state (lazy, not in INIT_PARAMS_SCHEMA)
    if not hasattr(self, "_reasoning_trace"):
        self._reasoning_trace = []
        self._tool_call_records = []
        self._messages = []
        self._step_index = 0
        self._total_tokens = {"prompt": 0, "completion": 0, "total": 0}
    
    while self._step_index < self.max_reasoning_steps:
        # Respect pause command
        await self._pause_gate.wait()
        
        # Call LLM
        response = await self._call_llm_with_retry()
        
        # Parse action
        action = await self._parse_action_safe(response)
        
        # Record reasoning step
        step = self._record_reasoning_step(response, action)
        
        # Checkpoint at every step boundary
        await self.enqueue_checkpoint()
        
        self._step_index += 1
        
        if action == AgentAction.FINISH:
            break
        elif action == AgentAction.TOOL_CALL:
            await self._execute_tool_call(response)
        elif action == AgentAction.HANDOFF:
            self._validate_handoff_target(response.handoff_target)
            break
        elif action == AgentAction.PAUSE:
            self._pause_gate.clear()
            continue
        elif action == AgentAction.THINK:
            self._messages.append(response.thought)
            continue
        elif action == AgentAction.ERROR:
            break
    
    return self._prepare_final_result()
```

**Why the ReAct loop is in process(), not in Pointy-Lang:**
The architecture document explains this: Pointy-Lang has no loop construct. This forces the ReAct loop to live inside `process()` — an implementation detail of the agent, not a workflow structure concern. The graph remains statically analyzable. The agent's internal reasoning doesn't leak into the orchestration layer.

**Checkpointing at every step:**
Each reasoning step is a checkpoint boundary. If the agent crashes at step 12 of 15, it resumes from step 12 — not step 0. For an agent using Claude Opus at scale, this saves hundreds of dollars in API costs per crash. No other agent framework provides sub-step checkpointing.

## Governed Tools
Tools are `EventBase` subclasses. They're executed through the full event lifecycle — not called as plain functions.

### Tool Declaration
```python
class FetchMarketData(EventBase):
    """Tool: Fetch current market data for a symbol."""
    
    INIT_PARAMS_SCHEMA = {
        "symbol": {"type": str, "required": True},
        "timeframe": {"type": str, "default": "1d"},
    }
    
    executor_class = "DefaultExecutor"  # I/O-bound API call
    
    async def process(self, *args, **kwargs):
        symbol = self.options.extras["symbol"]
        data = await market_api.fetch(symbol)
        return True, data

class CalculateRisk(EventBase):
    """Tool: Calculate value-at-risk for a portfolio."""
    
    INIT_PARAMS_SCHEMA = {
        "confidence": {"type": float, "default": 0.95},
    }
    
    executor_class = "RustExecutor"  # CPU-bound computation
    
    async def process(self, *args, **kwargs):
        portfolio = await self.previous_result.first()
        risk = await rust_risk_engine.calculate(portfolio.content)
        return True, risk
```

Key points:
* Tools are full events with their own executor declarations. `FetchMarketData` runs in async (I/O-bound). `CalculateRisk` runs in Rust (CPU-bound).
* Tools are called via `await tool_instance(...)`, which invokes the full lifecycle — `_pre_process`, `_process`, `_post_process`, retry, resource cleanup. Calling `tool_instance.process()` directly would bypass the lifecycle and is prohibited.
* Tools have their own `INIT_PARAMS_SCHEMA`. The agent passes parameters from the LLM's function call.

### ToolPermissionError
If the LLM attempts to call a tool not declared in the agent's `tools` list, the framework raises `ToolPermissionError`:

```text
# Agent declares:
tools = [FetchMarketData, CalculateRisk]

# LLM attempts to call:
# → "call SendEmail" — NOT in tools list

# Framework raises:
# ToolPermissionError: Agent 'TradingAnalyst' attempted to call
# undeclared tool 'SendEmail'. Declared tools: FetchMarketData,
# CalculateRisk. This attempt has been logged.
```

This is a security event recorded in the audit trail. It prevents prompt injection attacks where a malicious user convinces the LLM to call arbitrary functions. The agent can only do what it was explicitly authorized to do.

### Tool Execution and Checkpointing
When a tool executes:
* The agent creates a child command channel for the tool.
* The tool runs with its own lifecycle — its own executor, its own retry policy, its own checkpoint.
* The tool's execution state becomes a child node in the agent's fractal execution tree.
* If the tool crashes mid-execution, it resumes from its own checkpoint without restarting the agent.
* If the agent is paused during a tool call, the tool checkpoints and releases resources. The agent pauses. On resume, the tool resumes from its checkpoint.

**Shared checkpoint manager:**
The tool receives `checkpoint_manager=self.checkpoint_manager` from the agent. The tool's checkpoints are siblings of the agent's checkpoints in the fractal tree. A crashed tool doesn't lose the agent's reasoning progress.

## Governed Handoffs
Agents can hand off to other agents. Handoffs are declared and validated:

```python
class TradingAnalyst(AgentEventBase):
    permitted_handoffs = ["ComplianceReviewer", "SeniorTrader"]
    
    async def _handle_handoff(self, target: str, context: dict):
        if target not in self.permitted_handoffs:
            raise ToolPermissionError(
                f"Agent '{self.__class__.__name__}' attempted to hand off to "
                f"undeclared agent '{target}'. Permitted handoffs: "
                f"{self.permitted_handoffs}"
            )
        
        # Handoff is permitted — signal the engine to route to the target agent
        self.goto(
            descriptor=self._handoff_descriptors[target],
            result_success=True,
            result=context,
        )
```

Handoffs are implemented via CFG mode's event reuse. The Pointy-Lang file declares the handoff flow:

```pointy
TradingAnalyst -> {
    ComplianceReviewer -> TradingAnalyst,
    SeniorTrader -> ExecuteDecision
}
```

`TradingAnalyst` hands off to `ComplianceReviewer`, which may hand back to `TradingAnalyst` for revision. The cycle is expressed in CFG mode without a loop construct in the language. Each traversal is a discrete execution with its own checkpoint.

## Prompt Versioning
Every prompt has a version. The version is stamped into:
* Every reasoning step in the audit trail
* The EventHub manifest (for agent packages)
* The execution trace

```python
class TradingAnalyst(AgentEventBase):
    prompt_version = "1.2.0"
    system_prompt = """
    You are a trading analyst. Your role is to evaluate market data
    and recommend trades. You have access to market data and risk
    calculation tools. Always explain your reasoning.
    """
```

Why this matters:
* **Auditability**: An auditor can trace a trading decision back to the exact prompt version that produced it. If a prompt change leads to different behaviour, the version history shows when the change occurred and what changed.
* **Reproducibility**: To reproduce an agent's behaviour from last month, use the same prompt version. The prompt is part of the agent's versioned configuration.
* **Gradual rollout**: Deploy a new prompt version alongside the old one. Compare behaviour. Roll back if needed. The version is explicit.

## Token Tracking
Every LLM call records token usage:

```python
self._total_tokens = {
    "prompt": 0,        # Total input tokens
    "completion": 0,    # Total output tokens
    "total": 0,         # Sum
}
```

Token usage is:
* Emitted as soft signals — `agent_token_usage` events for monitoring and alerting
* Recorded in the OTel trace — per-step and per-agent spans
* Available in the audit trail — query total token spend per workflow, per agent, per time period
* Budgeted — agents can declare a `token_budget` to cap consumption

## LLM Provider Adapters
Volnux ships with adapters for major LLM providers:

**OpenAI:**
```python
class TradingAnalyst(AgentEventBase):
    llm_provider = "openai"
    model = "gpt-4-turbo"
    temperature = 0.1
```
* Native function calling via `tool_calls` in the API response
* Automatic retry on rate limits
* Token counting from `usage` field

**Anthropic:**
```python
class TradingAnalyst(AgentEventBase):
    llm_provider = "anthropic"
    model = "claude-3-opus-20240229"
```
* System prompt separation (native Anthropic feature)
* Tool use blocks with `input_schema` format
* Role conversion: `role="tool"` → `role="user"` for the messages API

**Gemini:**
```python
class TradingAnalyst(AgentEventBase):
    llm_provider = "gemini"
    model = "gemini-1.5-pro"
```
* Runs in thread pool (Gemini SDK is synchronous)
* History conversion for alternating roles
* `FunctionDeclaration` format for tools
* Token counting from `usage_metadata`

**Ollama (local):**
```python
class TradingAnalyst(AgentEventBase):
    llm_provider = "ollama"
    model = "llama3:70b"
```
* Uses `httpx.AsyncClient` for async HTTP calls
* Non-streaming mode for deterministic responses
* Configurable base URL via `OLLAMA_BASE_URL` environment variable
* Token counting from `prompt_eval_count` / `eval_count`

**Custom providers:**
```python
from volnux.agents.providers import LLMProviderRegistry

@LLMProviderRegistry.register("custom")
class CustomProvider(LLMProviderAdapter):
    async def call(self, messages, tools, **kwargs):
        # Your custom implementation
        pass
```

## HITL in Agent Workflows
Agents can request human input using the same `communicate()` hook as any other event:

```python
class TradingAnalyst(AgentEventBase):
    async def communicate(self, *args, **kwargs):
        # Before reasoning, check if human override is needed
        if self.requires_human_approval():
            await self.request_human_input(
                title="Agent requires approval",
                payload={"context": self.context},
                timeout_hours=2,
            )
    
    async def process(self, *args, **kwargs):
        # Check if human provided guidance
        hitl_response = await self.previous_result.filter(type="hitl").first()
        if hitl_response:
            self._messages.append({
                "role": "user",
                "content": f"Human guidance: {hitl_response.content['decision']}"
            })
        
        return await self._run_agent_loop(**kwargs)
```

The agent suspends before reasoning. The human reviews the context and provides guidance. The agent resumes with the human's input in its message history. The entire conversation — LLM calls and human input — is captured in the audit trail.

## Comparison with LangGraph/CrewAI/AutoGen

| Feature | LangGraph | CrewAI | AutoGen | Volnux |
| :--- | :--- | :--- | :--- | :--- |
| **Sub-step checkpointing** | No — node boundaries only | No | No | Yes — every reasoning step |
| **Crash recovery** | Restart from scratch | Restart from scratch | Restart from scratch | Resume from last checkpoint |
| **Tool governance** | Any function in scope | Any function in scope | Any function in scope | Declared tools only — `ToolPermissionError` |
| **Prompt versioning** | No — strings in code | No | No | Yes — stamped in audit trail |
| **HITL suspension** | `interrupt()` holds thread | No | No | `communicate()` suspends fully |
| **Command channel** | No | No | No | Pause/resume/cancel mid-reasoning |
| **Audit trail** | No | No | No | Full OTel trace + fractal execution tree |
| **Executor dispatch** | Single runtime | Single runtime | Single runtime | Per-tool executor (async/process/Rust) |
| **Handoff governance** | No | No | No | `permitted_handoffs` — validated at runtime |

Volnux agents are not faster at prototyping than LangGraph. They're more durable, more governable, and more auditable. For a regulated enterprise deploying AI agents to production, these are not optional features — they're requirements. LangGraph, CrewAI, and AutoGen are excellent for experimentation. 

Volnux is built for production governance.
