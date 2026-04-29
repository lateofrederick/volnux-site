<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()

// ============================================
// TYPED TEXT EFFECT
// ============================================
const heroWords = ['think', 'flow', 'scale', 'govern']
const currentWordIndex = ref(0)
const displayedText = ref('')
const isDeleting = ref(false)

function typeEffect() {
  const currentWord = heroWords[currentWordIndex.value]
  
  if (isDeleting.value) {
    displayedText.value = currentWord.substring(0, displayedText.value.length - 1)
  } else {
    displayedText.value = currentWord.substring(0, displayedText.value.length + 1)
  }

  if (!isDeleting.value && displayedText.value === currentWord) {
    isDeleting.value = true
    setTimeout(typeEffect, 2000)
  } else if (isDeleting.value && displayedText.value === '') {
    isDeleting.value = false
    currentWordIndex.value = (currentWordIndex.value + 1) % heroWords.length
    setTimeout(typeEffect, 500)
  } else {
    setTimeout(typeEffect, isDeleting.value ? 50 : 100)
  }
}

// ============================================
// MOUSE SPOTLIGHT
// ============================================
const mouseX = ref(0)
const mouseY = ref(0)
const heroRef = ref<HTMLElement | null>(null)

const spotlightStyle = computed(() => {
  // Light mode needs more opacity to be visible on white
  const color = isDark.value ? '99, 102, 241' : '67, 56, 202' // Indigo-500 for dark, Indigo-700 for light
  const opacity = isDark.value ? '0.15' : '0.18'
  const size = isDark.value ? '1000px' : '800px'
  return {
    background: `radial-gradient(${size} circle at ${mouseX.value}px ${mouseY.value}px, rgba(${color}, ${opacity}), rgba(${color}, ${isDark.value ? '0.05' : '0.08'}) 40%, transparent 70%)`
  }
})

function handleMouseMove(e: MouseEvent) {
  if (!heroRef.value) return
  const rect = heroRef.value.getBoundingClientRect()
  mouseX.value = e.clientX - rect.left
  mouseY.value = e.clientY - rect.top
}

// ============================================
// ACTIVE TAB
// ============================================
const activeTab = ref<'ai' | 'data' | 'streaming' | 'automation'>('ai')

// ============================================
// DATA
// ============================================
const stats = [
  { value: '10x', label: 'Faster deployment' },
  { value: '99.9%', label: 'Uptime SLA' },
  { value: '50+', label: 'Enterprise teams' },
]

const problems = [
  { icon: 'M12 14l9-5-9-5-9 5 9 5z', title: 'Unreadable', desc: 'Your workflows require senior engineers to debug' },
  { icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z', title: 'No Governance', desc: 'Compliance asks what it does. You read source code' },
  { icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Single Point', desc: 'One scheduler, one database, one failure mode' },
  { icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', title: 'AI Afterthought', desc: 'Checkpointing bolted on. Not built for agents' },
]

const features = [
  {
    icon: '→',
    title: 'Pointy-lang',
    desc: 'A declarative workflow language that reads like plain English. Express control flow, parallelism, retries, and branching.',
    wide: true,
    code: `LoadUsers |-> MAP<ValidateProfile>
  -> Process(
    success -> Save -> NotifyTeam,
    failure -> Retry * 3 -> Alert
  )`,
  },
  {
    icon: '⬡',
    title: 'Decentralised P2P',
    desc: 'No central scheduler. No single point of failure. Dispatch tasks to any node or Celery worker.',
    code: `Extract[node="warehouse"]
  -> Transform[executor="celery"]
  -> Load`,
  },
  {
    icon: '↓',
    title: 'Runtime Assembly',
    desc: 'Pull EventBase implementations from PyPI, Git, or private registries at execution time.',
    code: `pypi:Extract@v1.2.2
  -> git:Transform@v3.1
  -> local:Load`,
  },
  {
    icon: '◎',
    title: 'Smart Checkpointing',
    desc: 'Every execution checkpointed automatically. Rehydrate from last known state on any available node.',
  },
  {
    icon: '◈',
    title: 'OpenTelemetry Native',
    desc: 'Every state transition traced automatically. Full audit trails without asking engineers for them.',
  },
]

const useCases: Record<string, {
  title: string
  subtitle: string
  desc: string
  points: string[]
  code: string
}> = {
  ai: {
    title: 'AI Workflows',
    subtitle: 'Orchestrate agents with confidence',
    desc: 'Multi-agent pipelines need reliable execution, automatic checkpointing across LLM calls, and conditional routing.',
    points: ['Checkpoint across async LLM calls', 'Conditional routing based on model output', 'Full OTEL trace for every decision'],
    code: `IngestQuery -> RouteIntent(
  data -> LoadContext -> GenerateResponse,
  action -> ValidatePermission -> Execute * 3,
  unknown -> EscalateToHuman
)`,
  },
  data: {
    title: 'Data Pipelines',
    subtitle: 'ETL that anyone can audit',
    desc: 'Replace fragile scripts with readable, versioned workflows any engineer can write and any stakeholder can review.',
    points: ['Versioned connectors from PyPI', 'Parallel extraction with sync barriers', 'Full lineage via OTEL'],
    code: `PostgresExtract@v2.1 |->
  MAP<Normalise> || Validate
  -> Process(
    valid -> SnowflakeLoad,
    invalid -> Quarantine
  )`,
  },
  streaming: {
    title: 'Streaming',
    subtitle: 'Continuous data, readable pipelines',
    desc: 'Handle continuous data flows with parallel processing, adaptive buffering, and stateful execution.',
    points: ['Parallel stream processing', 'Adaptive buffering', 'Dead letter routing'],
    code: `KafkaIngest |->
  MAP<ValidateEvent> || Checkpoint
  -> Enrich[executor="celery"]
  -> Aggregate -> Sink`,
  },
  automation: {
    title: 'Automation',
    subtitle: 'Business process in plain language',
    desc: 'Express approval workflows and event-driven processes in language your entire organisation understands.',
    points: ['Conditional approval paths', 'Timeout and escalation', 'Complete audit trail'],
    code: `SubmitRequest -> Review * 2(
  approved -> Provision -> Notify,
  rejected -> Log -> Notify,
  timeout -> EscalateToManager
)`,
  },
}

const governancePillars = [
  { num: '01', title: 'Readable', desc: 'Pointy-lang IS the workflow. What you read is what executes.' },
  { num: '02', title: 'Auditable', desc: 'Every execution produces OpenTelemetry traces. Full replay capability.' },
  { num: '03', title: 'Interventable', desc: 'Pause, reroute, replay from checkpoint. Operator controls without code.' },
  { num: '04', title: 'Composable', desc: 'Teams publish to registry. Others consume by name. No shared codebases.' },
]

const comparisonRows = [
  { feature: 'Human-readable syntax', volnux: true, airflow: false, prefect: false, temporal: false },
  { feature: 'Decentralised P2P', volnux: true, airflow: false, prefect: false, temporal: false },
  { feature: 'Runtime assembly', volnux: true, airflow: false, prefect: false, temporal: false },
  { feature: 'Native AI support', volnux: true, airflow: 'partial', prefect: 'partial', temporal: 'partial' },
  { feature: 'Non-engineer readable', volnux: true, airflow: false, prefect: false, temporal: false },
  { feature: 'Built-in governance', volnux: true, airflow: 'partial', prefect: 'partial', temporal: 'partial' },
  { feature: 'No central scheduler', volnux: true, airflow: false, prefect: false, temporal: false },
]

// ============================================
// SCROLL REVEAL
// ============================================
const mainEl = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  typeEffect()

  const el = mainEl.value
  if (!el) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed')
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
  )

  el.querySelectorAll('.reveal').forEach((node) => {
    observer?.observe(node)
  })
})

onUnmounted(() => {
  observer?.disconnect()
})

const currentUseCase = computed(() => useCases[activeTab.value])
</script>

<template>
  <main ref="mainEl" class="relative overflow-x-hidden bg-white transition-colors duration-300 dark:bg-[#0a0a0f]">
    <!-- ============================================
         HERO SECTION
         ============================================ -->
    <section
      ref="heroRef"
      id="hero"
      class="relative flex min-h-screen items-center overflow-hidden px-4 py-20 sm:px-6 lg:px-8"
      @mousemove="handleMouseMove"
    >
      <!-- Background gradients -->
      <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 transition-colors duration-300 dark:from-[#0a0a0f] dark:via-[#12121a] dark:to-[#0f0f16]" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.08),transparent_50%)] transition-colors duration-300 dark:bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_50%)]" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.05),transparent_50%)] transition-colors duration-300 dark:bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.1),transparent_50%)]" />
      
      <!-- Mouse spotlight -->
      <div class="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300" :style="spotlightStyle" />

      <!-- Grid pattern -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:60px_60px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />

      <div class="relative z-20 mx-auto w-full max-w-7xl">
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <!-- Left: Copy -->
          <div>
            <div class="reveal mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 dark:border-indigo-500/30 dark:bg-indigo-500/10">
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span class="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
              </span>
              <span class="text-sm font-medium text-indigo-700 dark:text-indigo-300">Now in Early Access</span>
            </div>

            <h1 class="reveal mb-6 text-5xl font-bold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
              Workflows that
              <br />
              <span class="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-fuchsia-400">{{ displayedText }}</span><span class="animate-pulse text-indigo-500 dark:text-indigo-400">|</span>
            </h1>

            <p class="reveal mb-8 text-lg leading-relaxed text-slate-600 dark:text-slate-400 sm:text-xl">
              Volnux is the execution layer for the AI age. Write distributed workflows in <span class="font-medium text-indigo-600 dark:text-indigo-400">Pointy-lang</span> — a declarative DSL that engineers deploy and stakeholders understand.
            </p>

            <div class="reveal mb-10 flex flex-col gap-3 sm:flex-row">
              <a href="#" class="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40">
                <span class="relative z-10">Get Early Access</span>
                <svg class="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <a href="#features" class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/50 px-6 py-3 text-base font-medium text-slate-700 backdrop-blur-sm transition-all hover:border-indigo-500/50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:text-white">
                See how it works
              </a>
            </div>

            <div class="reveal flex gap-8">
              <div v-for="stat in stats" :key="stat.label">
                <div class="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{{ stat.value }}</div>
                <div class="text-sm text-slate-500 dark:text-slate-500">{{ stat.label }}</div>
              </div>
            </div>
          </div>

          <!-- Right: Code Card -->
          <div class="reveal relative">
            <div class="absolute -inset-1 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-500 opacity-20 blur-xl transition-opacity duration-300 dark:opacity-20" />
            
            <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl transition-colors duration-300 dark:border-slate-800 dark:bg-[#0d0d12]">
              <div class="flex items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <div class="flex gap-1.5">
                  <div class="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <div class="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div class="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div class="ml-3 flex flex-1 items-center justify-center">
                  <span class="text-xs text-slate-400 dark:text-slate-500">workflow.pointy</span>
                </div>
              </div>

              <div class="p-5">
                <pre class="font-mono text-sm leading-relaxed"><code><span class="text-slate-400"># AI pipeline with parallel validation</span>
<span class="text-indigo-600 dark:text-indigo-300">LoadUsers</span> <span class="text-violet-600 dark:text-violet-400">|-></span> <span class="text-emerald-600 dark:text-emerald-300">MAP</span><span class="text-slate-700 dark:text-slate-300">&lt;</span><span class="text-indigo-600 dark:text-indigo-300">ValidateProfile</span><span class="text-slate-700 dark:text-slate-300">&gt;</span>
  <span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-indigo-600 dark:text-indigo-300">EnrichWithAI</span><span class="text-amber-600 dark:text-amber-300">[node="gpu-cluster"]</span> <span class="text-amber-600 dark:text-amber-300">* 3</span>
  <span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-indigo-600 dark:text-indigo-300">Process</span><span class="text-slate-700 dark:text-slate-300">(</span>
    <span class="text-emerald-600 dark:text-emerald-300">success</span> <span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-indigo-600 dark:text-indigo-300">Store</span> <span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-indigo-600 dark:text-indigo-300">NotifyTeam</span><span class="text-slate-700 dark:text-slate-300">,</span>
    <span class="text-rose-600 dark:text-rose-300">failure</span> <span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-indigo-600 dark:text-indigo-300">Quarantine</span> <span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-indigo-600 dark:text-indigo-300">AlertOps</span>
  <span class="text-slate-700 dark:text-slate-300">)</span></code></pre>
              </div>

              <div class="flex items-center gap-4 border-t border-slate-200 px-4 py-2 dark:border-slate-800">
                <span class="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  compiled
                </span>
                <span class="text-xs text-slate-300 dark:text-slate-600">|</span>
                <span class="text-xs text-slate-500">3 nodes active</span>
                <span class="ml-auto text-xs text-indigo-600 dark:text-indigo-400">Pointy-lang v2.1</span>
              </div>
            </div>

            <div class="absolute -right-4 top-10 rounded-lg border border-slate-200 bg-white p-3 shadow-xl transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900">
              <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 text-xs font-bold text-white">P</div>
                <div class="text-xs">
                  <div class="font-medium text-slate-900 dark:text-white">P2P Mesh</div>
                  <div class="text-slate-500">Connected</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         PROBLEM SECTION
         ============================================ -->
    <section id="problem" class="relative border-y border-slate-200 bg-slate-50/50 py-16 transition-colors duration-300 dark:border-slate-800/50 dark:bg-[#0c0c10]">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal mb-10 text-center">
          <span class="mb-2 text-xs font-semibold uppercase tracking-widest text-rose-500">The Problem</span>
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Current tools were built for engineers.
            <span class="text-slate-400">Forgotten by everyone else.</span>
          </h2>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(problem, i) in problems"
            :key="problem.title"
            class="reveal group relative overflow-hidden rounded-lg border border-slate-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-rose-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-rose-500/30 dark:hover:shadow-rose-500/10"
            :style="{ transitionDelay: `${i * 50}ms` }"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-rose-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div class="relative">
              <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
                <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" :d="problem.icon" />
                </svg>
              </div>
              <h3 class="mb-1 font-semibold text-slate-900 dark:text-white">{{ problem.title }}</h3>
              <p class="text-sm text-slate-500">{{ problem.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         FEATURES SECTION
         ============================================ -->
    <section id="features" class="relative py-16 transition-colors duration-300 dark:bg-[#0a0a0f]">
      <div class="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 opacity-50 transition-opacity duration-300 dark:from-[#0c0c10] dark:via-[#0a0a0f] dark:to-[#0c0c10] dark:opacity-100" />
      
      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal mb-12 text-center">
          <span class="mb-2 text-xs font-semibold uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Platform</span>
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Everything your workflows need</h2>
        </div>

        <div class="grid gap-4 lg:grid-cols-3">
          <!-- Wide card -->
          <div class="reveal group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl lg:col-span-2 dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-indigo-500/30 dark:hover:shadow-indigo-500/10">
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div class="relative">
              <div class="mb-4 flex items-center gap-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 text-xl font-bold text-white shadow-lg shadow-indigo-500/25">→</div>
                <h3 class="text-xl font-bold text-slate-900 dark:text-white">Pointy-lang</h3>
              </div>
              <p class="mb-4 max-w-xl text-slate-600 dark:text-slate-400">A declarative workflow language that reads like plain English. Express control flow, parallelism, retries, and branching in syntax anyone can understand.</p>
              <div class="overflow-hidden rounded-lg border border-slate-200 bg-slate-900 p-4 dark:border-slate-800 dark:bg-[#0a0a0f]">
                <pre class="font-mono text-xs leading-relaxed text-slate-300"><span class="text-indigo-400">LoadUsers</span> <span class="text-violet-400">|-></span> <span class="text-emerald-400">MAP</span><span class="text-slate-300">&lt;</span><span class="text-indigo-400">ValidateProfile</span><span class="text-slate-300">&gt;</span>
<span class="text-slate-500">  -></span> <span class="text-indigo-400">Process</span><span class="text-slate-300">(</span>
<span class="text-slate-500">    </span><span class="text-emerald-400">success</span> <span class="text-slate-500">-></span> <span class="text-indigo-400">Save</span> <span class="text-slate-500">-></span> <span class="text-indigo-400">NotifyTeam</span><span class="text-slate-300">,</span>
<span class="text-slate-500">    </span><span class="text-rose-400">failure</span> <span class="text-slate-500">-></span> <span class="text-indigo-400">Retry</span> <span class="text-amber-400">* 3</span>
<span class="text-slate-500">  )</span></pre>
              </div>
            </div>
          </div>

          <!-- Regular cards -->
          <div
            v-for="(feature, i) in features.slice(1)"
            :key="feature.title"
            class="reveal group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-indigo-500/30 dark:hover:shadow-indigo-500/10"
            :style="{ transitionDelay: `${(i + 1) * 100}ms` }"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div class="relative">
              <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-lg font-bold text-indigo-600 dark:bg-slate-800 dark:text-indigo-400">{{ feature.icon }}</div>
              <h3 class="mb-2 font-semibold text-slate-900 dark:text-white">{{ feature.title }}</h3>
              <p class="mb-4 text-sm text-slate-600 dark:text-slate-400">{{ feature.desc }}</p>
              <div v-if="feature.code" class="overflow-hidden rounded border border-slate-200 bg-slate-900 p-3 dark:border-slate-800 dark:bg-[#0a0a0f]">
                <pre class="font-mono text-xs leading-relaxed text-slate-400">{{ feature.code }}</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         USE CASES SECTION
         ============================================ -->
    <section id="usecases" class="relative border-y border-slate-200 bg-slate-50/50 py-16 transition-colors duration-300 dark:border-slate-800/50 dark:bg-[#0c0c10]">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal mb-8 text-center">
          <span class="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">Use Cases</span>
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Built for what matters</h2>
        </div>

        <!-- Tabs -->
        <div class="reveal mb-8 flex flex-wrap justify-center gap-2">
          <button
            v-for="key in (['ai', 'data', 'streaming', 'automation'] as const)"
            :key="key"
            class="rounded-lg px-5 py-2.5 text-sm font-medium transition-all duration-300"
            :class="activeTab === key
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
              : 'border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-400 dark:hover:border-indigo-500/50'"
            @click="activeTab = key"
          >
            {{ useCases[key].title }}
          </button>
        </div>

        <!-- Content -->
        <div class="reveal">
          <Transition
            mode="out-in"
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 translate-y-4"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-4"
          >
            <div :key="activeTab" class="grid gap-8 lg:grid-cols-2 lg:gap-12">
              <div class="space-y-4">
                <h3 class="text-2xl font-bold text-slate-900 dark:text-white">{{ currentUseCase.subtitle }}</h3>
                <p class="text-slate-600 dark:text-slate-400">{{ currentUseCase.desc }}</p>
                <ul class="space-y-2">
                  <li v-for="point in currentUseCase.points" :key="point" class="flex items-center gap-2">
                    <svg class="h-5 w-5 text-indigo-600 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    <span class="text-slate-700 dark:text-slate-300">{{ point }}</span>
                  </li>
                </ul>
              </div>
              <div class="relative">
                <div class="absolute -inset-2 rounded-xl bg-gradient-to-r from-indigo-500/20 to-violet-500/20 blur-xl" />
                <div class="relative overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
                  <div class="flex items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
                    <div class="flex gap-1.5">
                      <div class="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                      <div class="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                      <div class="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                    </div>
                    <span class="ml-2 text-xs text-slate-400 dark:text-slate-600">{{ activeTab }}.pointy</span>
                  </div>
                  <div class="p-4">
                    <pre class="font-mono text-sm leading-relaxed text-slate-600 dark:text-slate-400">{{ currentUseCase.code }}</pre>
                  </div>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </section>

    <!-- ============================================
         GOVERNANCE SECTION
         ============================================ -->
    <section id="governance" class="relative py-16 transition-colors duration-300 dark:bg-[#0a0a0f]">
      <div class="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 opacity-50 transition-opacity duration-300 dark:from-[#0c0c10] dark:via-[#0a0a0f] dark:to-[#0c0c10] dark:opacity-100" />
      
      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal mb-10 text-center">
          <span class="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Governance</span>
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Governance is not a feature.
            <span class="text-emerald-600 dark:text-emerald-400"> It is the foundation.</span>
          </h2>
        </div>

        <div class="reveal grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(pillar, i) in governancePillars"
            :key="pillar.title"
            class="group relative overflow-hidden rounded-lg border border-slate-200 bg-white p-5 transition-all duration-500 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-emerald-500/30 dark:hover:shadow-emerald-500/10"
            :style="{ transitionDelay: `${i * 100}ms` }"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div class="relative">
              <div class="mb-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">{{ pillar.num }}</div>
              <h3 class="mb-1 font-semibold text-slate-900 dark:text-white">{{ pillar.title }}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-500">{{ pillar.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         COMPARISON SECTION
         ============================================ -->
    <section id="comparison" class="relative border-t border-slate-200 bg-slate-50/50 py-16 transition-colors duration-300 dark:border-slate-800/50 dark:bg-[#0c0c10]">
      <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div class="reveal mb-10 text-center">
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Not a scheduler.
            <span class="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent dark:from-indigo-400 dark:to-violet-400"> Something new.</span>
          </h2>
        </div>

        <div class="reveal overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table class="w-full text-left text-sm">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/50">
                <th class="p-4 font-semibold text-slate-900 dark:text-white sm:p-5">Capability</th>
                <th class="p-4 text-center font-bold text-indigo-600 dark:text-indigo-400 sm:p-5">Volnux</th>
                <th class="p-4 text-center text-slate-500 sm:p-5">Airflow</th>
                <th class="p-4 text-center text-slate-500 sm:p-5">Prefect</th>
                <th class="p-4 text-center text-slate-500 sm:p-5">Temporal</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in comparisonRows" :key="row.feature" class="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800/50 dark:hover:bg-slate-800/30">
                <td class="p-4 font-medium text-slate-900 dark:text-white sm:p-5">{{ row.feature }}</td>
                <td class="p-4 text-center text-indigo-600 dark:text-indigo-400 sm:p-5">
                  <svg class="mx-auto h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                  </svg>
                </td>
                <td class="p-4 text-center text-slate-400 sm:p-5">
                  <span v-if="row.airflow === true">✓</span>
                  <span v-else-if="row.airflow === 'partial'" class="text-amber-500">◐</span>
                  <span v-else>—</span>
                </td>
                <td class="p-4 text-center text-slate-400 sm:p-5">
                  <span v-if="row.prefect === true">✓</span>
                  <span v-else-if="row.prefect === 'partial'" class="text-amber-500">◐</span>
                  <span v-else>—</span>
                </td>
                <td class="p-4 text-center text-slate-400 sm:p-5">
                  <span v-if="row.temporal === true">✓</span>
                  <span v-else-if="row.temporal === 'partial'" class="text-amber-500">◐</span>
                  <span v-else>—</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- ============================================
         CTA SECTION
         ============================================ -->
    <section class="relative py-16 transition-colors duration-300 dark:bg-[#0a0a0f]">
      <div class="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 opacity-50 transition-opacity duration-300 dark:from-[#0c0c10] dark:via-[#0a0a0f] dark:to-[#0c0c10] dark:opacity-100" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1),transparent_70%)]" />
      
      <div class="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div class="reveal">
          <h2 class="mb-4 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">Ready to build workflows that think?</h2>
          <p class="mb-8 text-slate-600 dark:text-slate-400">Join hundreds of teams using Volnux to orchestrate AI workflows, data pipelines, and business processes.</p>
          <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#" class="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40">
              Get Early Access
              <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a href="mailto:hello@volnux.ai" class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/50 px-6 py-3 text-base font-medium text-slate-700 backdrop-blur-sm transition-all hover:border-indigo-500/50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:text-white">
              Talk to Sales
            </a>
          </div>
        </div>
      </div>
    </section>
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

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

::selection {
  background: rgba(99, 102, 241, 0.3);
  color: white;
}
</style>
