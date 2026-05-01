<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()

const mainEl = ref<HTMLElement | null>(null)
const hoveredPillar = ref<number | null>(null)
let observer: IntersectionObserver | null = null

// ============================================
// MOUSE SPOTLIGHT
// ============================================
const mouseX = ref(0)
const mouseY = ref(0)
const heroRef = ref<HTMLElement | null>(null)

const spotlightStyle = computed(() => {
  const color = isDark.value ? '99, 102, 241' : '67, 56, 202'
  return {
    background: `radial-gradient(800px circle at ${mouseX.value}px ${mouseY.value}px, rgba(${color}, ${isDark.value ? '0.12' : '0.1'}), rgba(${color}, 0) 70%)`
  }
})

function handleMouseMove(e: MouseEvent) {
  if (!heroRef.value) return
  const rect = heroRef.value.getBoundingClientRect()
  mouseX.value = e.clientX - rect.left
  mouseY.value = e.clientY - rect.top
}

// ============================================
// DATA
// ============================================
const heroStats = [
  { num: '73', suffix: '%', label: 'of incidents traced to ungoverned automation' },
  { num: '4', suffix: '\u00d7', label: 'faster resolution with audit-ready workflows' },
  { num: '0', suffix: '', label: 'extra code to achieve governance in Volnux' },
  { num: '100', suffix: '%', label: 'of Volnux workflows auditable by default' },
]

const pillars = [
  {
    num: '01',
    title: 'Transparency',
    span: 'See through the machine',
    desc: 'Every workflow is readable by non-engineers. The definition is the documentation. No gap between intent and implementation.',
    icon: '\u2728',
    gradient: 'from-indigo-500 to-violet-500',
  },
  {
    num: '02',
    title: 'Auditability',
    span: 'Every move recorded',
    desc: 'Every execution is traced. Every state transition, branch decision, and retry is recorded and replayable on demand.',
    icon: '\uD83D\uDCCB',
    gradient: 'from-violet-500 to-purple-500',
  },
  {
    num: '03',
    title: 'Accountability',
    span: 'Names on every action',
    desc: 'Every workflow has an owner. Every component has a publisher. Every change has a version.',
    icon: '\u2705',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    num: '04',
    title: 'Interventability',
    span: 'Control at any moment',
    desc: 'Running workflows can be paused, inspected, rerouted, or replayed from any checkpoint. Operators have real controls.',
    icon: '\u26A1',
    gradient: 'from-amber-500 to-orange-500',
  },
]

const costCards = [
  {
    tag: 'Regulatory',
    title: 'Compliance exposure',
    desc: 'GDPR, SOC 2, HIPAA increasingly require explainability. Ungoverned workflows cannot provide it.',
    icon: '\uD83D\uDEE1\uFE0F',
    color: 'rose',
  },
  {
    tag: 'Operational',
    title: 'Black-box debugging',
    desc: 'Without an audit trail, root cause analysis takes days instead of minutes.',
    icon: '\uD83D\uDD0D',
    color: 'amber',
  },
  {
    tag: 'Organisational',
    title: 'Knowledge rot',
    desc: 'Engineers leave. Documentation goes stale. Critical automation becomes unmaintainable legacy.',
    icon: '\uD83E\uDDE0',
    color: 'indigo',
  },
  {
    tag: 'Strategic',
    title: 'AI deployment risk',
    desc: 'Deploying agents without governance is not a technical risk — it is a business risk.',
    icon: '\uD83E\uDD16',
    color: 'emerald',
  },
]

const approachCards = [
  {
    num: '01',
    emoji: '\uD83D\uDCD6',
    title: 'Readable by design',
    tagline: 'A language humans can read',
    desc: 'Pointy-lang is a declarative DSL that reads like plain language. Control flow, parallelism, retries, and conditional routing are all visible in the workflow definition itself.',
    file: 'approval-flow.pointy',
    code: `<span class="text-slate-400 dark:text-slate-500 italic dark:italic"># A compliance officer can read this</span>
<span class="text-indigo-600 dark:text-indigo-300">SubmitRequest</span> <span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-indigo-600 dark:text-indigo-300">Review</span> <span class="text-amber-600 dark:text-amber-300">* 2</span>(
  <span class="text-emerald-600 dark:text-emerald-300">approved</span> <span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-indigo-600 dark:text-indigo-300">Provision</span> <span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-indigo-600 dark:text-indigo-300">Notify</span>,
  <span class="text-rose-600 dark:text-rose-300">rejected</span> <span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-indigo-600 dark:text-indigo-300">LogDecision</span> <span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-indigo-600 dark:text-indigo-300">Notify</span>,
  <span class="text-amber-600 dark:text-amber-300">timeout</span> <span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-indigo-600 dark:text-indigo-300">EscalateToManager</span>
)`,
  },
  {
    num: '02',
    emoji: '\uD83D\uDD14',
    title: 'Auditable by default',
    tagline: 'You get this for free',
    desc: 'Every Volnux execution emits a complete OpenTelemetry trace automatically. Every state transition, every retry attempt, every checkpoint is recorded without extra code.',
    file: 'audit-trail.otel',
    code: `<span class="text-slate-400 dark:text-slate-500 italic"># Every node emits a trace span</span>
<span class="text-cyan-700 dark:text-cyan-400">otel.trace_id</span> <span class="text-slate-500">=</span> <span class="text-pink-600 dark:text-pink-400">"4bf92f3577b34da6"</span>
<span class="text-cyan-700 dark:text-cyan-400">otel.span_id</span>  <span class="text-slate-500">=</span> <span class="text-pink-600 dark:text-pink-400">"00f067aa0ba902b7"</span>
<span class="text-cyan-700 dark:text-cyan-400">checkpoint</span>    <span class="text-slate-500">=</span> <span class="text-pink-600 dark:text-pink-400">"review:attempt_2"</span>
<span class="text-cyan-700 dark:text-cyan-400">branch_taken</span>  <span class="text-slate-500">=</span> <span class="text-pink-600 dark:text-pink-400">"approved"</span>
<span class="text-cyan-700 dark:text-cyan-400">duration_ms</span>   <span class="text-slate-500">=</span> <span class="text-amber-600 dark:text-amber-400">142</span>`,
  },
  {
    num: '03',
    emoji: '\uD83C\uDFAE',
    title: 'Interventable at runtime',
    tagline: 'Pause. Breathe. Fix.',
    desc: 'Volnux workflows can be paused mid-execution, inspected at any checkpoint, rerouted to a different node, or replayed from a known-good state.',
    file: 'runtime-control.sh',
    code: `<span class="text-indigo-600 dark:text-indigo-300">volnux pause</span>   <span class="text-violet-600 dark:text-violet-400">--workflow</span> <span class="text-emerald-600 dark:text-emerald-300">etl-daily</span>
<span class="text-indigo-600 dark:text-indigo-300">volnux inspect</span> <span class="text-violet-600 dark:text-violet-400">--checkpoint</span> <span class="text-emerald-600 dark:text-emerald-300">last</span>
<span class="text-indigo-600 dark:text-indigo-300">volnux replay</span>  <span class="text-violet-600 dark:text-violet-400">--from</span> <span class="text-emerald-600 dark:text-emerald-300">review:attempt_1</span>
<span class="text-indigo-600 dark:text-indigo-300">volnux reroute</span> <span class="text-violet-600 dark:text-violet-400">--node</span> <span class="text-emerald-600 dark:text-emerald-300">Transform</span>`,
  },
]

const features = [
  { dot: 'indigo', title: 'Pointy-lang readability', desc: 'Arrow-based syntax that expresses full control flow — parallelism, retries, and conditional branching.' },
  { dot: 'violet', title: 'OpenTelemetry traces', desc: 'Complete OTEL trace per execution covering all nodes, edges, branches, retries, and checkpoints.' },
  { dot: 'emerald', title: 'Automatic checkpointing', desc: 'Execution is checkpointed at every boundary. Checkpoints are governance records — replayable on demand.' },
  { dot: 'amber', title: 'Versioned components', desc: 'Every EventBase component is version-pinned. The execution record captures the exact resolved version.' },
  { dot: 'indigo', title: 'Runtime intervention', desc: 'Pause, inspect, reroute, replay — without modifying code or redeploying.' },
  { dot: 'violet', title: 'P2P mesh accountability', desc: 'Node annotations create an explicit execution topology. Every task is traceable to its node.' },
  { dot: 'emerald', title: 'EventHub manifests', desc: 'Structured version history, deprecation notices, parameter schemas, and evaluation strategies.' },
]

const outcomes = [
  'Pass regulatory audits with execution traces, not narratives',
  'Reduce MTTR by tracing incidents to root cause in minutes',
  'Deploy AI agents with explainability built in from day one',
  'Onboard engineers in days with self-documenting workflows',
  'Scale automation without accumulating governance debt',
  'Replace tribal knowledge with auditable process definitions',
]

const useCaseItems = [
  {
    icon: '\uD83C\uDFDB\uFE0F',
    title: 'Regulatory compliance',
    subtitle: 'Finance \u00b7 Healthcare \u00b7 Insurance',
    desc: 'Every execution is a compliance record. The workflow definition is the policy. The OTEL trace is the evidence.',
    tags: ['GDPR', 'SOC 2', 'HIPAA', 'Audit Trail'],
  },
  {
    icon: '\uD83D\uDEE1\uFE0F',
    title: 'Operational resilience',
    subtitle: 'Platform engineering \u00b7 SRE',
    desc: 'When a pipeline fails at 2am, Volnux gives operators a precise replay of every execution.',
    tags: ['Incident Response', 'Root Cause', 'Checkpointing'],
  },
  {
    icon: '\uD83E\uDD16',
    title: 'AI governance',
    subtitle: 'ML engineering \u00b7 AI products',
    desc: 'Every LLM call traced back to its input. AI that is explainable without custom instrumentation.',
    tags: ['LLM Tracing', 'Agent Decisions', 'Explainability'],
  },
  {
    icon: '\uD83D\uDEE0\uFE0F',
    title: 'Workflow engineering',
    subtitle: 'Data engineering \u00b7 Platforms',
    desc: 'Build pipelines any engineer can understand and any auditor can review.',
    tags: ['Self-Documenting', 'Version Control', 'Onboarding'],
  },
]

onMounted(() => {
  const el = mainEl.value
  if (!el) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('revealed')
      })
    },
    { threshold: 0.08, rootMargin: '0px 0px -50px 0px' }
  )

  el.querySelectorAll('.reveal').forEach((node) => observer?.observe(node))
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <main ref="mainEl" class="relative overflow-x-hidden bg-white transition-colors duration-300 dark:bg-[#0a0a0f]">
    <!-- ============================================
         HERO  Stripe-style animated headline
         ============================================ -->
    <section
      ref="heroRef"
      class="relative min-h-[90vh] flex items-center overflow-hidden px-4 pt-20 pb-16 sm:px-6 lg:px-8"
      @mousemove="handleMouseMove"
    >
      <!-- Background -->
      <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 dark:from-[#0a0a0f] dark:via-[#12121a] dark:to-[#0f0f16]" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.06),transparent_50%)] dark:bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.12),transparent_50%)]" />
      <div class="pointer-events-none absolute inset-0 z-10" :style="spotlightStyle" />

      <!-- Dots pattern -->
      <div class="absolute inset-0 opacity-[0.03] dark:opacity-[0.02]" style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 24px 24px;" />

      <div class="relative z-20 mx-auto w-full max-w-6xl">
        <div class="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <!-- Left -->
          <div class="reveal">
            <div class="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 backdrop-blur-sm dark:border-indigo-500/30 dark:bg-indigo-500/10">
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span class="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
              </span>
              <span class="text-sm font-medium text-indigo-700 dark:text-indigo-300">Volnux — Workflow Governance</span>
            </div>

            <h1 class="mb-6 text-4xl font-bold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              The systems that run your business<br />
              <span class="relative">
                <span class="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-fuchsia-400">deserve to be understood.</span>
                <svg class="absolute -bottom-1 left-0 h-3 w-full text-indigo-400/20 dark:text-indigo-500/20" viewBox="0 0 100 8" preserveAspectRatio="none">
                  <path d="M0,4 Q25,0 50,4 T100,4" stroke="currentColor" stroke-width="3" fill="none" />
                </svg>
              </span>
            </h1>

            <p class="mb-8 max-w-lg text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Workflow governance is the practice of making every automated process readable, auditable, and controllable by everyone with a stake in it — not just the engineers who built it. <span class="font-semibold text-indigo-600 dark:text-indigo-400">Volnux makes this the default.</span>
            </p>

            <div class="flex flex-wrap gap-3">
              <a href="#volnux-approach" class="group inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 hover:-translate-y-0.5">
                See how it works
                <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a href="/" class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/50 px-6 py-3 text-base font-medium text-slate-700 backdrop-blur-sm transition-all hover:border-indigo-500/50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:text-white">
                ← Back to home
              </a>
            </div>
          </div>

          <!-- Right: Floating visual card -->
          <div class="reveal relative">
            <!-- Glow -->
            <div class="absolute -inset-2 rounded-2xl bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-fuchsia-500/20 blur-xl" />

            <div class="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-2xl backdrop-blur transition-colors dark:border-slate-800 dark:bg-slate-900/90">
              <div class="mb-5 flex items-center gap-2">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-sm dark:bg-indigo-500/20">\uD83D\uDEE1\uFE0F</span>
                <div>
                  <div class="text-sm font-semibold text-slate-900 dark:text-white">Governance guarantees</div>
                  <div class="text-xs text-slate-500">Built into every Volnux workflow</div>
                </div>
              </div>

              <div class="space-y-3">
                <div v-for="item in [
                  { label: 'Readability', desc: 'Any stakeholder can understand', color: 'indigo' },
                  { label: 'Auditability', desc: 'Full replay capability', color: 'violet' },
                  { label: 'Traceability', desc: 'Every decision recorded', color: 'emerald' },
                  { label: 'Interventability', desc: 'Pause, reroute, replay', color: 'amber' },
                ]" :key="item.label" class="group/pill">
                  <div class="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50/50 px-4 py-3 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:bg-slate-800/50">
                    <div class="flex items-center gap-3">
                      <div
                        class="h-2 w-2 rounded-full"
                        :class="{
                          'bg-indigo-500': item.color === 'indigo',
                          'bg-violet-500': item.color === 'violet',
                          'bg-emerald-500': item.color === 'emerald',
                          'bg-amber-500': item.color === 'amber',
                        }"
                      />
                      <div>
                        <div class="text-sm font-medium text-slate-900 dark:text-white">{{ item.label }}</div>
                        <div class="text-xs text-slate-500">{{ item.desc }}</div>
                      </div>
                    </div>
                    <svg class="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats  bordered grid -->
        <div class="reveal mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800 sm:grid-cols-4">
          <div v-for="stat in heroStats" :key="stat.label" class="bg-white p-4 text-center dark:bg-slate-900 sm:p-5">
            <div class="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
              {{ stat.num }}<span class="text-indigo-600 dark:text-indigo-400">{{ stat.suffix }}</span>
            </div>
            <div class="text-xs text-slate-500">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         PILLARS — Animated Cards
         ============================================ -->
    <section class="relative border-y border-slate-200 bg-slate-50/50 py-16 transition-colors dark:border-slate-800/50 dark:bg-[#0c0c10] sm:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal mb-10 text-center">
          <span class="mb-2 block text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">The four pillars</span>
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            What every governed workflow needs
          </h2>
        </div>

        <div class="grid gap-5 sm:grid-cols-2">
          <div
            v-for="(pillar, i) in pillars"
            :key="pillar.title"
            class="reveal group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50 sm:p-8"
            :style="{ transitionDelay: `${i * 100}ms` }"
            @mouseenter="hoveredPillar = i"
            @mouseleave="hoveredPillar = null"
          >
            <!-- Gradient overlay on hover -->
            <div
              class="absolute inset-0 transition-opacity duration-500"
              :class="{
                'bg-gradient-to-br from-indigo-500/[0.04] to-violet-500/[0.04]': true,
                'opacity-100': hoveredPillar === i,
                'opacity-0': hoveredPillar !== i,
              }"
            />

            <!-- Top gradient bar -->
            <div
              class="absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              :class="pillar.gradient.replace('from-', 'from-')"
            />

            <div class="relative">
              <div class="mb-5 flex items-center gap-4">
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110"
                  :class="pillar.gradient"
                >
                  <span class="opacity-90">{{ pillar.icon }}</span>
                </div>
                <div class="flex-1">
                  <div class="text-sm font-semibold text-indigo-600 dark:text-indigo-400">{{ pillar.num }}</div>
                  <div class="text-lg font-bold text-slate-900 dark:text-white">{{ pillar.title }}</div>
                </div>
              </div>

              <p class="text-sm italic text-indigo-600/70 dark:text-indigo-400/70 sm:text-base">{{ pillar.span }}</p>
              <p class="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{{ pillar.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         COST  Tag Cards
         ============================================ -->
    <section id="why" class="relative py-16 sm:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal mb-10 text-center">
          <span class="mb-2 block text-xs font-semibold uppercase tracking-widest text-rose-500">The cost</span>
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            The cost of <span class="text-rose-600 dark:text-rose-400">ungoverned</span> automation
          </h2>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(card, i) in costCards"
            :key="card.title"
            class="reveal group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50 sm:p-7"
            :style="{ transitionDelay: `${i * 80}ms` }"
          >
            <!-- Top gradient bar -->
            <div
              class="absolute inset-x-0 top-0 h-1"
              :class="{
                'bg-rose-500': card.color === 'rose',
                'bg-amber-500': card.color === 'amber',
                'bg-indigo-500': card.color === 'indigo',
                'bg-emerald-500': card.color === 'emerald',
              }"
            />

            <div class="relative">
              <div class="mb-4 flex items-center gap-3">
                <div
                  class="flex h-10 w-10 items-center justify-center rounded-xl text-lg transition-transform group-hover:scale-110"
                  :class="{
                    'bg-rose-100 dark:bg-rose-500/20': card.color === 'rose',
                    'bg-amber-100 dark:bg-amber-500/20': card.color === 'amber',
                    'bg-indigo-100 dark:bg-indigo-500/20': card.color === 'indigo',
                    'bg-emerald-100 dark:bg-emerald-500/20': card.color === 'emerald',
                  }"
                >
                  {{ card.icon }}
                </div>
                <span
                  class="rounded px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider"
                  :class="{
                    'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400': card.color === 'rose',
                    'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400': card.color === 'amber',
                    'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400': card.color === 'indigo',
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400': card.color === 'emerald',
                  }"
                >{{ card.tag }}</span>
              </div>
              <h3 class="mb-2 font-semibold text-slate-900 dark:text-white">{{ card.title }}</h3>
              <p class="text-sm leading-relaxed text-slate-500">{{ card.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         APPROACH  Terminal-style cards
         ============================================ -->
    <section id="volnux-approach" class="relative border-y border-slate-200 bg-slate-50/50 py-16 transition-colors dark:border-slate-800/50 dark:bg-[#0c0c10] sm:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal mb-10 text-center">
          <span class="mb-2 block text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">How it works</span>
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Governance built into the <span class="text-violet-600 dark:text-violet-400">language itself.</span>
          </h2>
        </div>

        <div class="grid gap-6 lg:grid-cols-3">
          <div
            v-for="(card, i) in approachCards"
            :key="card.num"
            class="reveal group relative overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-500 hover:-translate-y-0.5 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/50"
            :style="{ transitionDelay: `${i * 100}ms` }"
          >
            <div class="p-6">
              <div class="mb-4 flex items-center gap-3">
                <div class="flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-lg dark:bg-violet-500/20">{{ card.emoji }}</div>
                <div>
                  <div class="text-xs font-semibold uppercase tracking-wide text-violet-600 dark:text-violet-400">{{ card.num }}</div>
                  <div class="text-base font-bold text-slate-900 dark:text-white">{{ card.title }}</div>
                </div>
              </div>

              <p class="mb-1 text-sm font-medium text-violet-600/70 dark:text-violet-400/70">{{ card.tagline }}</p>
              <p class="mb-5 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{{ card.desc }}</p>

              <!-- Terminal window -->
              <div class="overflow-hidden rounded-lg border border-slate-200 bg-slate-950 shadow-inner dark:border-slate-800">
                <div class="flex items-center gap-2 border-b border-slate-800/50 px-4 py-2">
                  <div class="flex gap-1.5">
                    <div class="h-2 w-2 rounded-full bg-red-500/60" />
                    <div class="h-2 w-2 rounded-full bg-amber-500/60" />
                    <div class="h-2 w-2 rounded-full bg-emerald-500/60" />
                  </div>
                  <span class="text-xs text-slate-600">{{ card.file }}</span>
                </div>
                <div class="p-4">
                  <pre class="font-mono text-xs leading-relaxed text-slate-600 dark:text-slate-400" v-html="card.code"></pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         FEATURES  Clean list
         ============================================ -->
    <section id="features" class="relative py-16 sm:py-20">
      <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div class="reveal mb-10 text-center">
          <span class="mb-2 block text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Capabilities</span>
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Every governance capability, <span class="text-indigo-600 dark:text-indigo-400">built in.</span>
          </h2>
        </div>

        <div class="reveal rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900/50">
          <div
            v-for="feature in features"
            :key="feature.title"
            class="flex items-start gap-4 border-b border-slate-100 p-5 transition-colors hover:bg-slate-50 last:border-b-0 dark:border-slate-800/50 dark:hover:bg-slate-800/30"
          >
            <div
              class="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
              :class="{
                'bg-indigo-500': feature.dot === 'indigo',
                'bg-violet-500': feature.dot === 'violet',
                'bg-emerald-500': feature.dot === 'emerald',
                'bg-amber-500': feature.dot === 'amber',
              }"
            />
            <div>
              <div class="font-medium text-slate-900 dark:text-white">{{ feature.title }}</div>
              <div class="mt-0.5 text-sm text-slate-500">{{ feature.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         BUSINESS VALUE + OUTCOMES
         ============================================ -->
    <section id="business" class="relative border-y border-slate-200 bg-slate-50/50 py-16 transition-colors dark:border-slate-800/50 dark:bg-[#0c0c10] sm:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div class="reveal">
            <span class="mb-2 block text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Business value</span>
            <h2 class="mb-6 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Governance as a<br />
              <span class="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">business capability.</span>
            </h2>
            <p class="mb-4 text-slate-600 dark:text-slate-400">
              Workflow governance is not an IT concern. It is a business capability that determines how confidently an organisation can operate at scale, respond to audits, deploy AI, and hold its automated systems accountable.
            </p>
            <p class="text-slate-600 dark:text-slate-400">
              The organisations that win the next decade will not be the ones that automate the most — they will be the ones that can explain, audit, and govern what their automation is doing.
            </p>
          </div>

          <div class="reveal">
            <div class="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/50 sm:p-8">
              <div class="mb-6 flex items-center gap-2">
                <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm dark:bg-emerald-500/20">\u2705</span>
                <span class="text-sm font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Outcomes</span>
              </div>
              <ul class="space-y-4">
                <li
                  v-for="outcome in outcomes"
                  :key="outcome"
                  class="flex items-start gap-3"
                >
                  <svg class="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-sm text-slate-700 dark:text-slate-300">{{ outcome }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         USE CASES  Compact emoji cards
         ============================================ -->
    <section class="relative py-16 sm:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal mb-10 text-center">
          <span class="mb-2 block text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">Applications</span>
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Where it matters most</h2>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(item, i) in useCaseItems"
            :key="item.title"
            class="reveal group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-indigo-500/30"
            :style="{ transitionDelay: `${i * 80}ms` }"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/[0.02] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <div class="relative">
              <div class="mb-4 text-2xl">{{ item.icon }}</div>
              <h3 class="mb-0.5 font-semibold text-slate-900 dark:text-white">{{ item.title }}</h3>
              <p class="mb-3 text-xs text-slate-500">{{ item.subtitle }}</p>
              <p class="mb-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{{ item.desc }}</p>
              <div class="flex flex-wrap gap-1.5">
                <span
                  v-for="tag in item.tags"
                  :key="tag"
                  class="rounded border border-slate-200 px-2 py-0.5 text-[0.65rem] text-slate-500 dark:border-slate-700 dark:text-slate-500"
                >{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         PRINCIPLES
         ============================================ -->
    <section id="principles" class="relative border-y border-slate-200 bg-slate-50/50 py-16 transition-colors dark:border-slate-800/50 dark:bg-[#0c0c10] sm:py-20">
      <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div class="reveal mb-10 text-center">
          <span class="mb-2 block text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Design</span>
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Governance <span class="text-indigo-600 dark:text-indigo-400">principles.</span></h2>
        </div>

        <div class="grid gap-5 md:grid-cols-3">
          <div
            v-for="(principle, i) in [
              { num: '01', title: 'Governance is not a feature', desc: 'It is the foundation. Every system is designed so that governance is the path of least resistance, not an add-on.' },
              { num: '02', title: 'Auditability is structural', desc: 'You cannot opt out. Every execution produces a complete trace. Every state transition is recorded. Compliance is the default state.' },
              { num: '03', title: 'Intervention is first-class', desc: 'Pause, inspect, reroute, replay — without modifying code or redeploying. Operators are not passengers.' },
            ]"
            :key="principle.num"
            class="reveal group rounded-xl border border-slate-200 bg-white p-6 transition-all hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-indigo-500/30"
            :style="{ transitionDelay: `${i * 100}ms` }"
          >
            <div class="mb-4 flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-400">
                {{ principle.num }}
              </div>
              <div class="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
            </div>
            <h3 class="mb-2 font-bold text-slate-900 dark:text-white">{{ principle.title }}</h3>
            <p class="text-sm leading-relaxed text-slate-600 dark:text-slate-400">{{ principle.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA removed per request -->
  </main>
</template>

<style scoped>
.reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.05); }
}

.animate-pulse {
  animation: pulse 6s ease-in-out infinite;
}
</style>