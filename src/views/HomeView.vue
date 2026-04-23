<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

type TabId = 'ai' | 'data' | 'streaming' | 'automation'

const mainEl = ref<HTMLElement | null>(null)
const activeTab = ref<TabId>('ai')
let observer: IntersectionObserver | null = null

const problemRows = [
  {
    t: 'Unreadable by design',
    p: 'Decorated Python functions and YAML configs require a senior engineer to debug and nobody else to understand.',
  },
  {
    t: 'No governance layer',
    p: 'Compliance teams ask what the workflow does. Engineering spends three days reading source code to answer.',
  },
  {
    t: 'Central points of failure',
    p: 'Every major engine assumes a central scheduler. One process, one database, one catastrophic failure mode.',
  },
  {
    t: 'AI workflows as an afterthought',
    p: 'LangChain and Temporal were not designed for agent orchestration. Checkpointing, fan-out, and conditional routing are bolted on.',
  },
] as const

const features = [
  {
    icon: '→',
    iconWrap: 'border-cyan-400/20 bg-cyan-400/10 text-cyan-300',
    title: 'Pointy-lang',
    body: 'A declarative workflow language built for humans. Express control flow, parallelism, retries, and branching in syntax that reads like plain English.',
    code: `<span class="font-medium text-vn-text">Load</span> <span class="text-vn-retry">* 3</span> <span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">Process</span>(<br/>&nbsp;&nbsp;<span class="text-vn-accent3">success</span> <span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">Save</span>,<br/>&nbsp;&nbsp;<span class="text-vn-accent3">failure</span> <span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">Reject</span><br/>)`,
  },
  {
    icon: '⬡',
    iconWrap: 'border-violet-400/20 bg-violet-400/10 text-violet-300',
    title: 'Decentralised P2P Mesh',
    body: 'No central scheduler. No single point of failure. Dispatch tasks to any node or Celery worker from within the workflow definition itself.',
    code: `<span class="font-medium text-vn-text">Extract</span><span class="text-vn-attr">[node=<span class="text-vn-string">&quot;warehouse&quot;</span>]</span><br/>&nbsp;&nbsp;<span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">Transform</span><span class="text-vn-attr">[executor=<span class="text-vn-string">&quot;celery&quot;</span>]</span><br/>&nbsp;&nbsp;<span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">Load</span>`,
  },
  {
    icon: '↓',
    iconWrap: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300',
    title: 'Runtime Component Assembly',
    body: 'Volnux pulls EventBase implementations from PyPI, Git, or your private registry at execution time. Write workflows without writing Python.',
    code: `<span class="text-vn-accent3">pypi</span><span class="text-vn-attr">:Extract@v1.2.2</span><br/>&nbsp;&nbsp;<span class="font-medium text-vn-accent">-&gt;</span> <span class="text-vn-accent3">git</span><span class="text-vn-attr">:Transform[version=<span class="text-vn-string">&quot;v3.1&quot;</span>]</span><br/>&nbsp;&nbsp;<span class="font-medium text-vn-accent">-&gt;</span> <span class="text-vn-accent3">local</span><span class="text-vn-attr">:Load</span>`,
  },
  {
    icon: '◎',
    iconWrap: 'border-orange-400/20 bg-orange-400/10 text-orange-300',
    title: 'Checkpointing & Rehydration',
    body: 'Every execution is checkpointed automatically. If a node fails or a worker crashes, Volnux rehydrates the workflow from the last known state on any available node.',
    code: null as string | null,
  },
  {
    icon: '◈',
    iconWrap: 'border-pink-400/20 bg-pink-400/10 text-pink-300',
    title: 'Native OpenTelemetry',
    body: 'Every state transition, retry, and branch decision is traced automatically. Full audit trails without asking engineers for them.',
    code: null as string | null,
  },
  {
    icon: 'λ',
    iconWrap: 'border-amber-400/20 bg-amber-400/10 text-amber-300',
    title: 'Functional Meta-Events',
    body: 'First-class MAP, FILTER, and REDUCE over collections with typed processors. Functional orchestration primitives for AI and streaming workflows.',
    code: `<span class="font-medium text-vn-text">LoadUsers</span> <span class="font-medium text-vn-accent2">|-></span><br/>&nbsp;&nbsp;<span class="text-vn-accent3">MAP</span><span class="text-vn-attr">&lt;ProcessUserProfile&gt;</span>`,
  },
] as const

const useCaseTabs = [
  { id: 'ai' as const, label: 'AI Workflows' },
  { id: 'data' as const, label: 'Data Pipelines' },
  { id: 'streaming' as const, label: 'Streaming' },
  { id: 'automation' as const, label: 'Automation' },
]

const ucAi = [
  'Checkpoint across async LLM calls — nothing is lost on failure',
  'Conditional routing based on model output',
  'Full OTEL trace for every agent decision',
  'Fan-out with MAP for parallel agent execution',
]

const ucAiCode = `<span class="font-medium text-vn-text">IngestQuery</span> <span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">RouteIntent</span>(<br/>&nbsp;&nbsp;<span class="text-vn-accent3">data</span> <span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">LoadContext</span> <span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">GenerateResponse</span>,<br/>&nbsp;&nbsp;<span class="text-vn-accent3">action</span> <span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">ValidatePermission</span><br/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">ExecuteAction</span> <span class="text-vn-retry">* 3</span>,<br/>&nbsp;&nbsp;<span class="text-vn-accent3">unknown</span> <span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">EscalateToHuman</span><br/>)`

const ucData = [
  'Pull versioned connectors from PyPI or your registry',
  'Parallel extraction with automatic sync barriers',
  'Conditional load paths based on validation outcome',
  'Full lineage via OTEL without extra tooling',
]

const ucDataCode = `<span class="text-vn-accent3">pypi</span><span class="text-vn-attr">:PostgresExtract@v2.1</span><br/>&nbsp;&nbsp;<span class="font-medium text-vn-accent2">|-></span> <span class="text-vn-accent3">MAP</span><span class="text-vn-attr">&lt;Normalise&gt;</span> <span class="font-medium text-vn-accent2">||</span> <span class="font-medium text-vn-text">Validate</span><br/>&nbsp;&nbsp;<span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">Process</span>(<br/>&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-vn-accent3">valid</span> <span class="font-medium text-vn-accent">-&gt;</span> <span class="text-vn-accent3">hub</span><span class="text-vn-attr">:SnowflakeLoad@v1.0</span>,<br/>&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-vn-accent3">invalid</span> <span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">Quarantine</span><br/>&nbsp;&nbsp;)`

const ucStream = [
  'Parallel stream processing with sync barriers',
  'Adaptive buffering for backpressure management',
  'Stateful execution with automatic checkpoints',
  'Dead letter routing for malformed events',
]

const ucStreamCode = `<span class="font-medium text-vn-text">KafkaIngest</span><br/>&nbsp;&nbsp;<span class="font-medium text-vn-accent2">|-></span> <span class="text-vn-accent3">MAP</span><span class="text-vn-attr">&lt;ValidateEvent&gt;</span> <span class="font-medium text-vn-accent2">||</span> <span class="font-medium text-vn-text">Checkpoint</span><br/>&nbsp;&nbsp;<span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">Enrich</span><span class="text-vn-attr">[executor=<span class="text-vn-string">&quot;celery&quot;</span>]</span><br/>&nbsp;&nbsp;<span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">Aggregate</span> <span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">Sink</span>`

const ucAuto = [
  'Conditional routing for approval and rejection paths',
  'Timeout and escalation with retry semantics',
  'Cross-team workflows with node dispatch',
  'Complete audit trail by default',
]

const ucAutoCode = `<span class="font-medium text-vn-text">SubmitRequest</span> <span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">Review</span> <span class="text-vn-retry">* 2</span>(<br/>&nbsp;&nbsp;<span class="text-vn-accent3">approved</span> <span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">Provision</span> <span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">NotifyUser</span>,<br/>&nbsp;&nbsp;<span class="text-vn-accent3">rejected</span> <span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">LogDecision</span> <span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">NotifyUser</span>,<br/>&nbsp;&nbsp;<span class="text-vn-accent3">timeout</span> <span class="font-medium text-vn-accent">-&gt;</span> <span class="font-medium text-vn-text">EscalateToManager</span><br/>)`

const governance = [
  {
    bar: 'before:bg-vn-accent',
    title: 'Readable by design',
    body: 'Pointy-lang is not documentation generated after the fact. It is the workflow. What you read is what executes. There is no gap between the diagram and the code. A compliance officer can review a workflow without opening a terminal.',
  },
  {
    bar: 'before:bg-vn-accent2',
    title: 'Auditable by default',
    body: 'Every execution produces a complete OpenTelemetry trace. Every component is versioned and resolved at runtime. Every state transition is checkpointed. Your audit trail is a full replay-capable execution record — not a log file.',
  },
  {
    bar: 'before:bg-vn-accent3',
    title: 'Interventable at every level',
    body: 'Pause a running workflow. Reroute execution to a different node. Replay from a checkpoint with a patched component. Operators get the controls production systems require without reading source code to use them.',
  },
  {
    bar: 'before:bg-vn-attr',
    title: 'Composable without chaos',
    body: 'Teams publish EventBase components to your private registry. Other teams consume them by name. No shared codebases. No deployment coordination. No surprise dependencies. Governance scales with your organisation.',
  },
] as const

const comparisonRows = [
  { cap: 'Human-readable workflow syntax', a: 'x', p: 'x', t: 'x' },
  { cap: 'Decentralised P2P execution', a: 'x', p: 'x', t: 'x' },
  { cap: 'Runtime component assembly', a: 'x', p: 'x', t: 'x' },
  { cap: 'Native AI workflow support', a: 'x', p: 'p', t: 'p' },
  { cap: 'Non-engineer readable', a: 'x', p: 'x', t: 'x' },
  { cap: 'Built-in governance and audit', a: 'p', p: 'p', t: 'p' },
  { cap: 'No central scheduler required', a: 'x', p: 'x', t: 'x' },
  { cap: 'Purpose-built DSL', a: 'x', p: 'x', t: 'x' },
] as const



function setTab(id: TabId) {
  activeTab.value = id
}

function cellMark(v: string) {
  if (v === 'x') return '<span class="text-vn-muted2">✗</span>'
  if (v === 'p') return '<span class="font-mono text-xs text-amber-300">partial</span>'
  return ''
}

onMounted(() => {
  const el = mainEl.value
  if (!el) return
  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          ;(e.target as HTMLElement).style.opacity = '1'
          ;(e.target as HTMLElement).style.transform = 'translateY(0)'
        }
      })
    },
    { threshold: 0.1 },
  )

  el
    .querySelectorAll<HTMLElement>(
      '.vn-reveal, section:not(#hero) .vn-section-tag, section:not(#hero) .vn-section-title, section:not(#hero) .vn-section-sub',
    )
    .forEach((node) => {
      if (node.closest('#hero')) return
      node.style.opacity = '0'
      node.style.transform = 'translateY(20px)'
      node.style.transition = 'opacity 0.5s ease, transform 0.5s ease'
      observer?.observe(node)
    })
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <main ref="mainEl" class="relative z-[1]">
    <section
      id="hero"
      class="relative flex min-h-[100dvh] items-center overflow-hidden pb-24 pt-28 sm:pt-32 lg:min-h-screen lg:pb-24 lg:pt-32"
    >
      <div
        class="pointer-events-none absolute -right-[200px] -top-[200px] h-[800px] w-[800px] rounded-full bg-[radial-gradient(circle,rgba(0,229,255,0.06)_0%,transparent_70%)]"
      />
      <div
        class="pointer-events-none absolute -bottom-[100px] -left-[100px] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(123,97,255,0.06)_0%,transparent_70%)]"
      />
      <div class="vn-container">
        <!-- index.html: .hero-layout — 1fr 1fr, gap 5rem, align-items center -->
        <div class="grid w-full grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div class="min-w-0">
            <p
              class="mb-6 flex animate-fade-up items-center gap-3 font-mono text-[0.8rem] uppercase tracking-[0.15em] text-vn-accent opacity-0 [animation-delay:0ms] [animation-fill-mode:forwards]"
            >
              <span class="h-px w-8 shrink-0 bg-vn-accent" />
              The Workflow Operating System
            </p>
            <h1
              class="animate-fade-up mb-6 font-display text-[clamp(1.5rem,7vw,5.5rem)] font-extrabold leading-[1.05] tracking-[-0.04em] text-vn-white opacity-0 [animation-delay:80ms] [animation-fill-mode:forwards]"
            >
              Workflows your <br class="hidden sm:block" />
              entire org can <br class="hidden sm:block" />
              <span class="text-vn-accent">read.</span>
            </h1>
            <p
              class="animate-fade-up mb-10 max-w-[540px] text-[1.15rem] leading-[1.8] text-vn-muted opacity-0 [animation-delay:160ms] [animation-fill-mode:forwards]"
            >
              Volnux is the execution layer for the AI age. Write distributed workflows in Pointy-lang — a declarative DSL
              that engineers deploy and stakeholders actually understand.
            </p>
            <div
              class="animate-fade-up mb-16 flex flex-col gap-4 opacity-0 sm:flex-row sm:flex-wrap [animation-delay:240ms] [animation-fill-mode:forwards]"
            >
              <a href="#" class="vn-btn-primary justify-center sm:justify-start">Get Early Access</a>
              <a href="#" class="vn-btn-outline justify-center sm:justify-start">Read the Docs →</a>
            </div>
          </div>

          <div
            class="w-full max-w-[560px] animate-fade-up opacity-0 [animation-delay:320ms] [animation-fill-mode:forwards] lg:justify-self-end"
          >
            <p class="vn-code-label">pointy-lang — production AI pipeline</p>
            <div class="vn-hero-code-block w-full min-w-0 text-[0.78rem] leading-[1.7] sm:text-[0.85rem] md:text-[0.95rem] md:leading-[1.8]">
              <span class="font-medium text-vn-text">LoadUsers</span>
              <span class="font-medium text-vn-accent2"> |-></span>
              <span class="font-medium text-vn-accent3">MAP</span><span class="text-vn-attr">&lt;ValidateProfile&gt;</span>
              <span class="font-medium text-vn-accent2"> ||</span> <span class="font-medium text-vn-text">Checkpoint</span><br />
              &nbsp;&nbsp;<span class="font-medium text-vn-accent">-></span> <span class="font-medium text-vn-text">EnrichWithAI</span><span class="text-vn-attr">[node=<span class="text-vn-string">"gpu-cluster"</span>]</span>
              <span class="text-vn-retry"> * 3</span><br />
              &nbsp;&nbsp;<span class="font-medium text-vn-accent">-></span> <span class="font-medium text-vn-text">Process</span>(<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-vn-accent3">success</span> <span class="font-medium text-vn-accent">-></span>
              <span class="font-medium text-vn-text">Store</span> <span class="font-medium text-vn-accent">-></span>
              <span class="font-medium text-vn-text">NotifyTeam</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-vn-accent3">failure</span> <span class="font-medium text-vn-accent">-></span>
              <span class="font-medium text-vn-text">Quarantine</span> <span class="font-medium text-vn-accent">-></span>
              <span class="font-medium text-vn-text">AlertOps</span><br />
              &nbsp;&nbsp;)
            </div>
            <div class="mt-4 flex flex-wrap gap-x-5 gap-y-2 font-mono text-[0.7rem] text-vn-muted sm:gap-6 sm:text-[0.75rem]">
              <span class="inline-flex items-center gap-2">
                <span class="inline-block size-1.5 animate-pulse-dot rounded-full bg-vn-accent3" />
                parallel validation
              </span>
              <span class="inline-flex items-center gap-2">
                <span class="inline-block size-1.5 animate-pulse-dot rounded-full bg-vn-accent3" />
                auto checkpoint
              </span>
              <span class="inline-flex items-center gap-2">
                <span class="inline-block size-1.5 animate-pulse-dot rounded-full bg-vn-accent3" />
                retry on fail
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="vn-divider" />

    <section id="problem" class="vn-section bg-vn-surface">
      <div class="vn-container">
        <div class="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <span class="vn-section-tag vn-reveal">The problem</span>
            <h2 class="vn-section-title vn-reveal">
              Your workflows are running.<br />Does anyone know what they do?
            </h2>
            <p class="vn-section-sub vn-reveal">
              Current tools were built for engineers and forgotten by everyone else. When something breaks at 2am, you
              don't need more code. You need clarity.
            </p>
          </div>
          <div class="flex flex-col gap-6">
            <div v-for="(row, i) in problemRows" :key="i" class="vn-reveal flex gap-4">
              <div
                class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded border border-red-400/20 bg-red-500/10 text-sm text-red-400"
              >
                ✗
              </div>
              <div>
                <strong class="mb-1 block font-medium text-vn-text">{{ row.t }}</strong>
                <p class="text-[0.95rem] leading-relaxed text-vn-muted">{{ row.p }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="vn-divider" />

    <section id="features" class="vn-section bg-vn-surface">
      <div class="vn-container">
        <span class="vn-section-tag vn-reveal">Platform</span>
        <h2 class="vn-section-title vn-reveal">Everything your workflows need.</h2>
        <p class="vn-section-sub vn-reveal mb-12 lg:mb-16">
          One engine. Every execution model. From a single local node to a distributed P2P mesh across your entire
          infrastructure.
        </p>
        <div
          class="vn-reveal grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-vn-border bg-vn-border sm:grid-cols-2 xl:grid-cols-3"
        >
          <article
            v-for="f in features"
            :key="f.title"
            class="bg-vn-surface p-8 transition-colors hover:bg-vn-surface2 sm:p-10"
          >
            <div class="mb-5 flex size-11 items-center justify-center rounded-lg border text-xl" :class="f.iconWrap">
              {{ f.icon }}
            </div>
            <h3 class="mb-3 font-display text-base font-bold tracking-tight text-vn-white">{{ f.title }}</h3>
            <p class="mb-5 text-[0.875rem] leading-relaxed text-vn-muted">{{ f.body }}</p>
            <div v-if="f.code" class="vn-code-block p-4 text-[0.8rem] leading-relaxed" v-html="f.code" />
          </article>
        </div>
      </div>
    </section>

    <div class="vn-divider" />

    <section id="usecases" class="vn-section bg-vn-surface">
      <div class="vn-container">
        <span class="vn-section-tag vn-reveal">Use Cases</span>
        <h2 class="vn-section-title vn-reveal">Built for the workflows that matter.</h2>
        <p class="vn-section-sub vn-reveal mb-10 lg:mb-12">
          One engine across every critical workload in your organisation.
        </p>

        <div class="vn-reveal grid grid-cols-1 divide-y divide-vn-border overflow-hidden rounded-lg border border-vn-border min-[400px]:grid-cols-2 min-[400px]:divide-y-0 sm:flex sm:flex-wrap sm:divide-x sm:divide-vn-border">
          <button
            v-for="t in useCaseTabs"
            :key="t.id"
            type="button"
            class="px-4 py-2.5 font-sans text-[0.8rem] font-medium transition sm:flex-1 sm:min-w-[140px] sm:px-5 sm:text-[0.875rem]"
            :class="
              activeTab === t.id
                ? 'bg-vn-surface2 text-vn-accent'
                : 'text-vn-muted hover:bg-vn-surface2 hover:text-vn-text'
            "
            @click="setTab(t.id)"
          >
            {{ t.label }}
          </button>
        </div>

        <div v-show="activeTab === 'ai'" class="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h3 class="mb-4 font-display text-xl font-bold tracking-tight text-vn-white sm:text-2xl">
              Orchestrate agents with confidence
            </h3>
            <p class="mb-6 text-[0.95rem] leading-relaxed text-vn-muted">
              Multi-agent pipelines need reliable execution, automatic checkpointing across LLM calls, and conditional
              routing based on model output. Volnux provides the execution substrate that ad-hoc Python scripts cannot.
            </p>
            <ul class="flex flex-col gap-2.5 text-[0.9rem] text-vn-muted">
              <li
                v-for="b in ucAi"
                :key="b"
                class="flex items-start gap-3 before:shrink-0 before:font-mono before:text-xs before:text-vn-accent before:content-['→']"
              >
                {{ b }}
              </li>
            </ul>
          </div>
          <div>
            <p class="vn-code-label">multi-agent pipeline</p>
            <div class="vn-code-block text-[0.8125rem] md:text-sm" v-html="ucAiCode" />
          </div>
        </div>

        <div v-show="activeTab === 'data'" class="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h3 class="mb-4 font-display text-xl font-bold tracking-tight text-vn-white sm:text-2xl">ETL that anyone can audit</h3>
            <p class="mb-6 text-[0.95rem] leading-relaxed text-vn-muted">
              Replace fragile ETL scripts and over-engineered DAG configurations with workflows any data engineer can write
              and any data stakeholder can review.
            </p>
            <ul class="flex flex-col gap-2.5 text-[0.9rem] text-vn-muted">
              <li
                v-for="b in ucData"
                :key="b"
                class="flex items-start gap-3 before:shrink-0 before:font-mono before:text-xs before:text-vn-accent before:content-['→']"
              >
                {{ b }}
              </li>
            </ul>
          </div>
          <div>
            <p class="vn-code-label">versioned etl pipeline</p>
            <div class="vn-code-block text-[0.8125rem] md:text-sm" v-html="ucDataCode" />
          </div>
        </div>

        <div v-show="activeTab === 'streaming'" class="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h3 class="mb-4 font-display text-xl font-bold tracking-tight text-vn-white sm:text-2xl">
              Continuous data, readable pipelines
            </h3>
            <p class="mb-6 text-[0.95rem] leading-relaxed text-vn-muted">
              Handle continuous data flows with parallel processing, adaptive buffering, and stateful execution. Volnux
              manages backpressure automatically.
            </p>
            <ul class="flex flex-col gap-2.5 text-[0.9rem] text-vn-muted">
              <li
                v-for="b in ucStream"
                :key="b"
                class="flex items-start gap-3 before:shrink-0 before:font-mono before:text-xs before:text-vn-accent before:content-['→']"
              >
                {{ b }}
              </li>
            </ul>
          </div>
          <div>
            <p class="vn-code-label">kafka streaming pipeline</p>
            <div class="vn-code-block text-[0.8125rem] md:text-sm" v-html="ucStreamCode" />
          </div>
        </div>

        <div v-show="activeTab === 'automation'" class="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h3 class="mb-4 font-display text-xl font-bold tracking-tight text-vn-white sm:text-2xl">
              Business process in plain language
            </h3>
            <p class="mb-6 text-[0.95rem] leading-relaxed text-vn-muted">
              Express approval workflows, notification chains, and event-driven processes in language your entire organisation
              understands. When compliance asks, show them the source.
            </p>
            <ul class="flex flex-col gap-2.5 text-[0.9rem] text-vn-muted">
              <li
                v-for="b in ucAuto"
                :key="b"
                class="flex items-start gap-3 before:shrink-0 before:font-mono before:text-xs before:text-vn-accent before:content-['→']"
              >
                {{ b }}
              </li>
            </ul>
          </div>
          <div>
            <p class="vn-code-label">approval automation</p>
            <div class="vn-code-block text-[0.8125rem] md:text-sm" v-html="ucAutoCode" />
          </div>
        </div>
      </div>
    </section>

    <div class="vn-divider" />

    <section id="governance" class="vn-section">
      <div class="vn-container max-w-[1120px]">
        <span class="vn-section-tag vn-reveal">Governance</span>
        <h2 class="vn-section-title vn-reveal">Governance is not a feature.<br />It is the foundation.</h2>
        <p class="vn-section-sub vn-reveal mb-12 max-w-3xl">
          Every enterprise deploying AI and automation at scale will face the same question: how do you maintain control
          over systems that move faster than any human can review?
        </p>
        <div class="grid grid-cols-1 gap-8 md:grid-cols-2">
          <article
            v-for="g in governance"
            :key="g.title"
            class="vn-reveal relative overflow-hidden rounded-lg border border-vn-border bg-vn-surface p-8 pl-8 before:absolute before:inset-y-0 before:left-0 before:w-[3px]"
            :class="g.bar"
          >
            <h3 class="mb-3 font-display text-base font-bold text-vn-white">{{ g.title }}</h3>
            <p class="text-[0.875rem] leading-relaxed text-vn-muted">{{ g.body }}</p>
          </article>
        </div>
      </div>
    </section>

    <div class="vn-divider" />

    <section id="comparison" class="vn-section">
      <div class="vn-container">
        <span class="vn-section-tag vn-reveal">Comparison</span>
        <h2 class="vn-section-title vn-reveal">Not a scheduler. Something new.</h2>
        <p class="vn-section-sub vn-reveal mb-10">
          Airflow schedules jobs. Prefect runs Python. Temporal manages state machines. Volnux governs operations.
        </p>
        <div class="vn-reveal overflow-x-auto rounded-xl border border-vn-border">
          <table class="w-full min-w-[640px] border-collapse text-left text-[0.875rem]">
            <thead>
              <tr class="border-b border-vn-border bg-vn-surface2">
                <th class="px-6 py-4 font-display text-[0.85rem] font-bold tracking-wide text-vn-text">Capability</th>
                <th class="bg-vn-accent/5 px-6 py-4 font-display text-[0.85rem] font-bold tracking-wide text-vn-accent">
                  Volnux
                </th>
                <th class="px-6 py-4 font-display text-[0.85rem] font-bold tracking-wide text-vn-muted">Airflow</th>
                <th class="px-6 py-4 font-display text-[0.85rem] font-bold tracking-wide text-vn-muted">Prefect</th>
                <th class="px-6 py-4 font-display text-[0.85rem] font-bold tracking-wide text-vn-muted">Temporal</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, idx) in comparisonRows"
                :key="row.cap"
                class="border-b border-vn-border transition-colors hover:bg-vn-surface2/80"
                :class="idx === comparisonRows.length - 1 ? 'border-b-0' : ''"
              >
                <td class="px-6 py-4 font-medium text-vn-text">{{ row.cap }}</td>
                <td class="bg-vn-accent/[0.04] px-6 py-4 text-vn-muted"><span class="text-vn-accent3">✓</span></td>
                <td class="px-6 py-4 text-vn-muted2" v-html="cellMark(row.a)" />
                <td class="px-6 py-4 text-vn-muted2" v-html="cellMark(row.p)" />
                <td class="px-6 py-4 text-vn-muted2" v-html="cellMark(row.t)" />
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>


  </main>
</template>
