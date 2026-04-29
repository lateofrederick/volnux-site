<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const mainEl = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

// Stats for hero
const heroStats = [
  { num: '73', suffix: '%', label: 'of compliance incidents traced to ungoverned automation' },
  { num: '4', suffix: '×', label: 'faster incident resolution with audit-ready workflows' },
  { num: '0', suffix: '', label: 'lines of extra code to achieve governance in Volnux' },
  { num: '100', suffix: '%', label: 'of Volnux workflows are auditable by default' },
]

// Governance pillars
const pillars = [
  {
    icon: 'transparency',
    title: 'Transparency',
    description: 'Every workflow is readable by non-engineers. The definition is the documentation. No gap between intent and implementation.',
  },
  {
    icon: 'auditability',
    title: 'Auditability',
    description: 'Every execution is traced. Every state transition, branch decision, and retry is recorded and replayable on demand.',
  },
  {
    icon: 'accountability',
    title: 'Accountability',
    description: 'Every workflow has an owner. Every component has a publisher. Every change has a version. Responsibility is never ambiguous.',
  },
  {
    icon: 'intervention',
    title: 'Interventability',
    description: 'Running workflows can be paused, inspected, rerouted, or replayed from any checkpoint. Operators have real controls — not just read-only dashboards.',
  },
]

// Cost cards
const costCards = [
  {
    label: 'Risk',
    title: 'Regulatory exposure',
    description: 'GDPR, SOC 2, HIPAA, and financial regulations increasingly require explainability of automated decisions. Ungoverned workflows cannot provide it.',
    borderColor: 'border-vn-accent',
  },
  {
    label: 'Operational',
    title: 'Black-box debugging',
    description: 'When a workflow misbehaves and there is no audit trail, root cause analysis takes days instead of minutes. Mean time to resolution multiplies.',
    borderColor: 'border-vn-accent2',
  },
  {
    label: 'Organisational',
    title: 'Knowledge rot',
    description: 'Engineers leave. Documentation goes stale. Within months, critical automated systems become unmaintainable legacy — the tax on every future change.',
    borderColor: 'border-vn-accent4',
  },
  {
    label: 'Strategic',
    title: 'AI deployment risk',
    description: 'Deploying agents without execution governance is not a technical risk — it is a business risk. What did the agent decide? Why? Who approved it?',
    borderColor: 'border-vn-accent3',
  },
]

// Volnux approach cards
const approachCards = [
  {
    num: '01',
    title: 'Readable by design',
    description: 'Pointy-lang is a declarative DSL that reads like plain language. Control flow, parallelism, retries, and conditional routing are all visible in the workflow definition itself.',
    code: `<span class="pt-cm"># A compliance officer can read this</span>
<span class="pt-nd">SubmitRequest</span>
<span class="pt-arr"> -> </span><span class="pt-nd">Review</span> <span class="pt-rt">* 2</span>(
  <span class="pt-meta">approved</span><span class="pt-arr"> -> </span><span class="pt-nd">Provision</span><span class="pt-arr"> -> </span><span class="pt-nd">NotifyUser</span>,
  <span class="pt-meta">rejected</span><span class="pt-arr"> -> </span><span class="pt-nd">LogDecision</span><span class="pt-arr"> -> </span><span class="pt-nd">NotifyUser</span>,
  <span class="pt-meta">timeout</span><span class="pt-arr"> -> </span><span class="pt-nd">EscalateToManager</span>
)`,
    accent: 'bg-vn-accent',
  },
  {
    num: '02',
    title: 'Auditable by default',
    description: 'Every Volnux execution emits a complete OpenTelemetry trace automatically. Every state transition, every branch taken, every retry attempt, every checkpoint is recorded.',
    code: `<span class="pt-cm"># Every node emits a trace span</span>
<span class="pt-ann">[otel.trace_id = "4bf92f3577b34da6"]</span>
<span class="pt-ann">[otel.span_id = "00f067aa0ba902b7"]</span>
<span class="pt-ann">[checkpoint = "review:attempt_2"]</span>
<span class="pt-ann">[branch_taken = "approved"]</span>
<span class="pt-ann">[duration_ms = 142]</span>`,
    accent: 'bg-vn-accent2',
  },
  {
    num: '03',
    title: 'Interventable at runtime',
    description: 'Volnux workflows can be paused mid-execution, inspected at any checkpoint, rerouted to a different node, or replayed from a known-good state.',
    code: `<span class="pt-cm"># Runtime intervention via CLI</span>
<span style="color:#7ee8b4">$</span> <span style="color:#f0ece4">volnux pause</span> <span style="color:#f5c270">--workflow etl-daily</span>
<span style="color:#7ee8b4">$</span> <span style="color:#f0ece4">volnux inspect</span> <span style="color:#f5c270">--checkpoint last</span>
<span style="color:#7ee8b4">$</span> <span style="color:#f0ece4">volnux replay</span> <span style="color:#f5c270">--from review:attempt_1</span>
<span style="color:#7ee8b4">$</span> <span style="color:#f0ece4">volnux reroute</span> <span style="color:#f5c270">--node Transform</span>`,
    accent: 'bg-vn-accent3',
  },
]

// Features list
const features = [
  { dot: 'bg-vn-accent', title: 'Pointy-lang readability', strong: 'Workflows readable by any stakeholder', description: 'Pointy-lang\'s arrow-based syntax expresses the full control flow — including parallelism, retries, and conditional branching — in plain readable syntax.' },
  { dot: 'bg-vn-accent2', title: 'OpenTelemetry traces', strong: 'Full distributed trace per execution', description: 'Every run emits a complete OTEL trace covering all nodes, edges, branches, retries, and checkpoints. Traces are queryable, exportable, and compatible with your existing observability stack.' },
  { dot: 'bg-vn-accent3', title: 'Checkpointing', strong: 'Replay-capable execution state', description: 'Every workflow is checkpointed at execution boundaries. Checkpoints are not just failure recovery — they are governance records. Any execution can be replayed from any checkpoint.' },
  { dot: 'bg-vn-accent4', title: 'Versioned components', strong: 'Immutable, auditable execution manifests', description: 'Every EventBase component pulled from PyPI, Git, or EventHub is version-pinned. The execution record captures the exact resolved version of every component.' },
  { dot: 'bg-vn-accent', title: 'Runtime intervention', strong: 'Pause, reroute, replay — without code changes', description: 'The Volnux CLI and API expose full runtime control. Running workflows can be paused, inspected at any checkpoint, and rerouted to a different execution node.' },
  { dot: 'bg-vn-accent2', title: 'P2P mesh accountability', strong: 'Every node in the execution mesh is identifiable', description: 'Node annotations in Pointy-lang create an explicit execution topology record. Every task is traceable to the specific node and process that ran it.' },
  { dot: 'bg-vn-accent3', title: 'EventHub manifests', strong: 'Published components carry governance metadata', description: 'Every EventHub package requires a volnux.manifest.json with structured version history, deprecation notices, parameter schemas, and evaluation strategies.' },
]

// Business outcomes
const businessOutcomes = [
  'Pass regulatory audits with execution traces, not narratives',
  'Reduce MTTR by tracing any incident to its root cause in minutes',
  'Deploy AI agents with explainability built in from day one',
  'Onboard engineers in days, not months, with self-documenting workflows',
  'Scale automation safely without accumulating governance debt',
  'Replace tribal knowledge with versioned, auditable process definitions',
]

// Use case cards
const useCases = [
  {
    title: 'Regulatory compliance',
    subtitle: 'Finance, healthcare, insurance',
    description: 'Regulated industries must demonstrate that automated decisions follow approved processes. With Volnux, every execution is a compliance record — the workflow definition is the policy, the OTEL trace is the evidence, and the checkpoint history is the audit trail.',
    tags: ['GDPR', 'SOC 2', 'HIPAA', 'Basel III', 'audit trail', 'explainability'],
    iconColor: 'border-vn-accent/20 bg-vn-accent/10 text-vn-accent',
  },
  {
    title: 'Operational resilience',
    subtitle: 'Platform engineering, SRE',
    description: 'When a production pipeline fails at 2am, the SRE needs to understand immediately what the workflow was doing, where it failed, and what state it left downstream systems in. Volnux checkpoints and traces give operators a precise replay of every execution.',
    tags: ['incident response', 'root cause', 'MTTR', 'checkpointing', 'replay'],
    iconColor: 'border-vn-accent2/20 bg-vn-accent2/10 text-vn-accent2',
  },
  {
    title: 'AI governance',
    subtitle: 'ML engineering, AI product teams',
    description: 'Every LLM call, every agent decision, every model output can be traced back to the input that produced it. Volnux provides the execution substrate that makes AI systems explainable and auditable without custom instrumentation.',
    tags: ['LLM tracing', 'agent decisions', 'explainability', 'audit trail', 'compliance'],
    iconColor: 'border-vn-accent3/20 bg-vn-accent3/10 text-vn-accent3',
  },
  {
    title: 'Workflow engineering',
    subtitle: 'Data engineering, platform teams',
    description: 'Build pipelines that any engineer can understand and any auditor can review. Versioned components, readable definitions, and complete execution traces mean no more "what does this script do?" at 2am.',
    tags: ['self-documenting', 'version control', 'team onboarding', 'knowledge transfer'],
    iconColor: 'border-vn-accent4/20 bg-vn-accent4/10 text-vn-accent4',
  },
]

// Principles
const principles = [
  {
    num: '01',
    title: 'Governance is not a feature',
    description: 'It is the foundation. Every system is designed so that governance is the path of least resistance, not an add-on.',
  },
  {
    num: '02',
    title: 'Auditability is structural',
    description: 'You cannot opt out. Every execution produces a complete trace. Every state transition is recorded.',
  },
  {
    num: '03',
    title: 'Intervention is a first-class operation',
    description: 'Pause, inspect, reroute, replay — without modifying code or redeploying.',
  },
]

onMounted(() => {
  const el = mainEl.value
  if (!el) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          ;(e.target as HTMLElement).classList.add('on')
        }
      })
    },
    { threshold: 0.1 },
  )

  el.querySelectorAll<HTMLElement>('.vn-reveal, .reveal-stagger').forEach((node) => {
    observer?.observe(node)
  })
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <main ref="mainEl" class="relative z-10">
    <!-- Hero Section -->
    <section id="hero" class="relative min-h-screen border-b border-vn-border">
      <!-- Background text -->
      <div class="pointer-events-none absolute right-[-2rem] top-1/2 hidden -translate-y-1/2 select-none whitespace-nowrap font-display text-[12rem] font-black italic leading-none text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.06)] lg:block lg:text-[16rem] xl:text-[22rem]">
        Govern
      </div>

      <div class="vn-container relative z-10 py-24 sm:py-32 lg:py-40">
        <div class="grid grid-cols-1 items-center gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <!-- Left content -->
          <div class="vn-reveal">
            <p class="vn-section-tag mb-6">Volnux — Workflow Governance</p>
            <h1 class="mb-6 font-display text-3xl font-bold leading-tight tracking-tight text-vn-white sm:text-4xl md:text-5xl lg:text-6xl">
              The systems that run<br />
              your business deserve<br />
              to be <span class="text-vn-accent italic">understood.</span>
            </h1>
            <p class="mb-8 max-w-lg text-base leading-relaxed text-vn-text2 sm:text-lg">
              Workflow governance is the practice of making every automated process readable, auditable, and controllable by everyone with a stake in it — not just the engineers who built it. Volnux makes this the default.
            </p>
            <div class="flex flex-wrap gap-3">
              <a href="#volnux-approach" class="vn-btn-primary">See how Volnux does it</a>
              <a href="/" class="vn-btn-outline">Back to home</a>
            </div>
          </div>

          <!-- Right: Pull quote -->
          <div class="vn-reveal hidden lg:block">
            <div class="border-l-4 border-vn-accent pl-6">
              <blockquote class="mb-4 font-display text-lg font-medium italic leading-relaxed text-vn-text2 sm:text-xl">
                "Governance is not a feature you add to workflows. It is the quality that makes a workflow trustworthy enough to run unsupervised at scale."
              </blockquote>
              <cite class="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-vn-muted not-italic">
                <span class="h-px w-4 bg-vn-muted"></span>
                Volnux Design Principles
              </cite>
            </div>
          </div>
        </div>

        <!-- Stats -->
        <div class="vn-reveal mt-16 grid grid-cols-2 gap-0 border-t border-vn-border pt-8 sm:mt-20 lg:grid-cols-4">
          <div
            v-for="(stat, i) in heroStats"
            :key="i"
            class="border-r border-vn-border px-4 py-4 text-center last:border-r-0 sm:px-6 sm:py-6"
          >
            <div class="font-display text-3xl font-bold text-vn-white sm:text-4xl">
              {{ stat.num }}<span class="text-vn-accent">{{ stat.suffix }}</span>
            </div>
            <div class="mt-2 font-mono text-xs uppercase tracking-wider text-vn-muted">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- What is Governance Section -->
    <section id="what" class="vn-section border-b border-vn-border bg-vn-surface">
      <div class="vn-container">
        <div class="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <!-- Left: Text -->
          <div class="vn-reveal">
            <p class="vn-section-tag">Definition</p>
            <h2 class="vn-section-title">What is workflow <span class="text-vn-accent">governance?</span></h2>

            <div class="mt-8 space-y-6">
              <h3 class="font-display text-lg font-bold text-vn-white sm:text-xl">Control over automated processes</h3>
              <p class="text-sm leading-relaxed text-vn-text2 sm:text-base">
                Workflow governance is the set of policies, practices, and tools that give an organisation visibility and control over its automated processes. It answers three fundamental questions: what is this workflow doing, why did it make each decision, and who is accountable if something goes wrong.
              </p>
              <p class="text-sm leading-relaxed text-vn-text2 sm:text-base">
                Without governance, workflows become black boxes. Engineers leave, documentation rots, and eventually nobody can explain to a regulator, a customer, or a board what a critical automated system actually does. Governance prevents that accumulation of technical and organisational debt.
              </p>
              <p class="text-sm leading-relaxed text-vn-text2 sm:text-base">
                Governance is not the same as monitoring. Monitoring tells you when something fails. Governance tells you what the system was authorised to do, whether it stayed within bounds, and how to trace every output back to its input.
              </p>

              <h3 class="mt-8 font-display text-lg font-bold text-vn-white sm:text-xl">The four governance questions</h3>
              <p class="text-sm leading-relaxed text-vn-text2 sm:text-base">
                Every governed workflow must be able to answer: <em>What</em> is it authorised to do? <em>Who</em> approved it? <em>What</em> did it actually do on each run? And <em>how</em> do we intervene when it behaves unexpectedly? Volnux builds the answers into the workflow itself — they are not afterthoughts.
              </p>
            </div>
          </div>

          <!-- Right: Pillars -->
          <div class="vn-reveal">
            <div class="flex flex-col gap-px overflow-hidden rounded-lg border border-vn-border bg-vn-border">
              <div
                v-for="(pillar, i) in pillars"
                :key="i"
                class="flex gap-4 bg-vn-surface p-5 transition-colors hover:bg-vn-surface2 sm:gap-5 sm:p-6"
              >
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-vn-border2 bg-vn-surface2">
                  <span class="text-lg">{{ ['🔍', '📋', '✓', '⚡'][i] }}</span>
                </div>
                <div>
                  <h4 class="mb-1 font-mono text-sm font-medium text-vn-white sm:text-base">{{ pillar.title }}</h4>
                  <p class="text-sm leading-relaxed text-vn-muted">{{ pillar.description }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Why It Matters Section -->
    <section id="why" class="vn-section border-b border-vn-border">
      <div class="vn-container">
        <div class="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <!-- Left: Prose -->
          <div class="vn-reveal">
            <p class="vn-section-tag">Importance</p>
            <h2 class="vn-section-title">The cost of <span class="text-vn-accent">ungoverned</span><br>automation</h2>

            <div class="mt-8 space-y-5 text-sm leading-relaxed text-vn-text2 sm:text-base">
              <p>
                The moment a workflow is deployed and left without governance, it begins accumulating risk. At first invisibly — the system runs, results arrive, no alarms fire. Then something changes. A dependency updates, a data schema shifts, an edge case appears that was never tested. And nobody can explain what the workflow was supposed to do, let alone what went wrong.
              </p>
              <p>
                In regulated industries the cost is direct: fines, failed audits, and mandatory remediation. In non-regulated industries the cost is subtler but equally real: customer trust eroded by unexplained errors, engineers paralysed by fear of touching brittle systems, and product velocity that grinds to a halt.
              </p>
              <p>
                The AI age accelerates this problem dramatically. Agents make decisions faster and in more contexts than any human-authored automation. Without governance infrastructure beneath them, agent workflows are not just risky — they are impossible to explain.
              </p>
              <p>
                Volnux treats governance as a foundational concern, not a feature release. Every workflow is governed by construction, before any compliance team asks, before any auditor arrives.
              </p>
            </div>
          </div>

          <!-- Right: Cost cards -->
          <div class="vn-reveal flex flex-col gap-4">
            <div
              v-for="(card, i) in costCards"
              :key="i"
              class="vn-card relative overflow-hidden border-l-4 pl-5"
              :class="card.borderColor"
            >
              <div class="mb-1 font-mono text-xs uppercase tracking-wider text-vn-muted">{{ card.label }}</div>
              <h3 class="mb-2 font-display text-base font-bold text-vn-white sm:text-lg">{{ card.title }}</h3>
              <p class="text-sm leading-relaxed text-vn-muted">{{ card.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Volnux Approach Section -->
    <section id="volnux-approach" class="vn-section border-b border-vn-border bg-vn-surface">
      <div class="vn-container">
        <div class="vn-reveal mb-12 text-center">
          <p class="vn-section-tag justify-center">How Volnux does it</p>
          <h2 class="vn-section-title">Governance built into the<br><span class="text-vn-accent">language itself.</span></h2>
          <p class="vn-section-sub mx-auto mt-4">
            Volnux does not add governance on top of workflows. Pointy-lang makes governance inescapable — a workflow that cannot be read, traced, and intervened upon cannot be expressed.
          </p>
        </div>

        <div class="reveal-stagger grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div
            v-for="(card, i) in approachCards"
            :key="i"
            class="vn-card-featured relative overflow-hidden"
          >
            <div class="absolute inset-x-0 top-0 h-1" :class="card.accent"></div>
            <div class="mb-4 font-display text-5xl font-black text-vn-border2/50 sm:text-6xl">{{ card.num }}</div>
            <h3 class="mb-3 font-display text-base font-bold text-vn-white sm:text-lg">{{ card.title }}</h3>
            <p class="mb-5 text-sm leading-relaxed text-vn-muted">{{ card.description }}</p>
            <div class="vn-code-block text-xs">
              <div class="font-mono leading-relaxed" v-html="card.code"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="vn-section border-b border-vn-border bg-vn-surface">
      <div class="vn-container">
        <div class="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 lg:items-start mb-12">
          <div class="vn-reveal">
            <p class="vn-section-tag">Platform features</p>
            <h2 class="vn-section-title">Every governance<br>capability, <span class="text-vn-accent">built in.</span></h2>
          </div>
          <div class="vn-reveal">
            <p class="text-sm leading-relaxed text-vn-text2 sm:text-base">
              Governance in Volnux is not a dashboard you bolt on. It is expressed through versioned components, immutable execution records, structured checkpoints, and a deployment model that separates who writes the workflow from who runs the infrastructure.
            </p>
          </div>
        </div>

        <div class="vn-reveal flex flex-col gap-px overflow-hidden rounded-lg border border-vn-border bg-vn-border">
          <div
            v-for="(feature, i) in features"
            :key="i"
            class="grid grid-cols-1 gap-0 bg-vn-surface transition-colors hover:bg-vn-surface2 sm:grid-cols-[200px_1fr]"
          >
            <div class="flex items-start gap-2 border-r-0 border-b border-vn-border p-4 font-mono text-xs font-medium text-vn-muted sm:border-b-0 sm:border-r sm:p-5">
              <div class="mt-1 h-2 w-2 shrink-0 rounded-full" :class="feature.dot"></div>
              {{ feature.title }}
            </div>
            <div class="p-4 sm:p-5">
              <strong class="mb-1 block text-sm font-medium text-vn-text">{{ feature.strong }}</strong>
              <p class="text-sm leading-relaxed text-vn-muted">{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Business Section -->
    <section id="business" class="vn-section border-b border-vn-border">
      <div class="vn-container">
        <div class="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <!-- Left: Content -->
          <div class="vn-reveal">
            <p class="vn-section-tag">Business value</p>
            <h2 class="vn-section-title">Governance as a<br><span class="text-vn-accent">business capability.</span></h2>
            <div class="mt-8 space-y-5 text-sm leading-relaxed text-vn-text2 sm:text-base">
              <p>
                Workflow governance is not an IT concern. It is a business capability that determines how confidently an organisation can operate at scale, respond to audits, deploy AI, and hold its automated systems accountable.
              </p>
              <p>
                The organisations that win the next decade of digital operations will not be the ones that automate the most — they will be the ones that can explain, audit, and govern what their automation is doing. Governance is the difference between automation as a liability and automation as a defensible competitive asset.
              </p>
              <p>
                Volnux makes governance the default for every workflow in your organisation, from a three-node ETL pipeline to a thousand-agent AI orchestration running across a global mesh.
              </p>
            </div>
          </div>

          <!-- Right: Outcomes -->
          <div class="vn-reveal">
            <div class="vn-card-featured border-t-4 border-t-vn-accent4">
              <div class="mb-4 font-mono text-xs uppercase tracking-wider text-vn-accent4">Business outcomes</div>
              <div class="flex flex-col gap-4">
                <div v-for="(outcome, i) in businessOutcomes" :key="i" class="flex items-start gap-3">
                  <span class="mt-1 text-vn-accent3">✓</span>
                  <span class="text-sm text-vn-text2">{{ outcome }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Use case cards -->
        <div class="reveal-stagger mt-16 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(useCase, i) in useCases"
            :key="i"
            class="vn-card"
          >
            <div class="mb-4 flex items-center gap-3">
              <div class="flex h-11 w-11 items-center justify-center rounded border text-xl" :class="useCase.iconColor">
                <span>◆</span>
              </div>
              <div>
                <h3 class="font-display text-base font-bold tracking-tight text-vn-white">{{ useCase.title }}</h3>
                <p class="font-mono text-xs text-vn-muted">{{ useCase.subtitle }}</p>
              </div>
            </div>
            <p class="mb-4 text-sm leading-relaxed text-vn-muted">{{ useCase.description }}</p>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="tag in useCase.tags"
                :key="tag"
                class="rounded border border-vn-border2 px-2 py-1 font-mono text-xs text-vn-muted"
              >
                {{ tag }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Principles Section -->
    <section id="principles" class="vn-section border-b border-vn-border bg-vn-surface">
      <div class="vn-container">
        <div class="vn-reveal mb-12 text-center">
          <p class="vn-section-tag justify-center">Design</p>
          <h2 class="vn-section-title">Governance <span class="text-vn-accent">principles.</span></h2>
        </div>

        <div class="reveal-stagger grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(principle, i) in principles"
            :key="i"
            class="border-t-2 border-vn-border2 pt-6 transition-colors hover:border-vn-accent"
          >
            <div class="mb-3 font-display text-4xl font-black text-vn-border2/30 sm:text-5xl">{{ principle.num }}</div>
            <h3 class="mb-2 font-display text-base font-bold text-vn-white sm:text-lg">{{ principle.title }}</h3>
            <p class="text-sm leading-relaxed text-vn-muted">{{ principle.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="relative overflow-hidden border-b border-vn-border bg-vn-accent py-20 sm:py-28">
      <!-- Background text -->
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <span class="font-display text-[8rem] font-black italic tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.08)] sm:text-[12rem] lg:text-[18rem]">
          Govern
        </span>
      </div>

      <div class="vn-container relative z-10 text-center">
        <div class="vn-reveal mx-auto max-w-2xl">
          <p class="mb-4 font-mono text-xs uppercase tracking-wider text-vn-black/60">Start governing</p>
          <h2 class="mb-6 font-display text-3xl font-black leading-tight tracking-tight text-vn-black sm:text-4xl lg:text-5xl">
            Ready to make your<br>workflows <span class="italic">governable?</span>
          </h2>
          <p class="mb-8 text-sm leading-relaxed text-vn-black/80 sm:text-base">
            Join the early access program and start building workflows that are readable, auditable, and controllable from day one.
          </p>
          <div class="flex flex-wrap justify-center gap-3">
            <a href="/" class="inline-flex items-center gap-2 rounded-md bg-vn-white px-6 py-3 font-sans text-sm font-semibold text-vn-accent transition hover:bg-vn-text hover:shadow-lg">Get early access</a>
            <a href="/docs" class="inline-flex items-center gap-2 rounded-md border border-vn-black/30 bg-transparent px-6 py-3 font-sans text-sm font-medium text-vn-black/80 transition hover:border-vn-black hover:text-vn-black">Read the docs</a>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Scroll reveal animations */
.vn-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.vn-reveal.on {
  opacity: 1;
  transform: translateY(0);
}

.reveal-stagger > * {
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.reveal-stagger.on > *:nth-child(1) { opacity: 1; transform: none; transition-delay: 0s; }
.reveal-stagger.on > *:nth-child(2) { opacity: 1; transform: none; transition-delay: 0.08s; }
.reveal-stagger.on > *:nth-child(3) { opacity: 1; transform: none; transition-delay: 0.16s; }
.reveal-stagger.on > *:nth-child(4) { opacity: 1; transform: none; transition-delay: 0.24s; }
</style>
