<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()

const mainEl = ref<HTMLElement | null>(null)
const heroRef = ref<HTMLElement | null>(null)
const mouseX = ref(0)
const mouseY = ref(0)

const spotlightStyle = computed(() => {
  const color = isDark.value ? '99, 102, 241' : '67, 56, 202'
  const opacity = isDark.value ? '0.12' : '0.18'
  const size = isDark.value ? '900px' : '800px'
  return {
    background: `radial-gradient(${size} circle at ${mouseX.value}px ${mouseY.value}px, rgba(${color}, ${opacity}), rgba(${color}, ${isDark.value ? '0.03' : '0.08'}) 40%, transparent 70%)`,
  }
})

function handleMouseMove(e: MouseEvent) {
  if (!heroRef.value) return
  const rect = heroRef.value.getBoundingClientRect()
  mouseX.value = e.clientX - rect.left
  mouseY.value = e.clientY - rect.top
}

let revealObserver: IntersectionObserver | null = null

onMounted(() => {
  const el = mainEl.value
  if (!el) return
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        const t = entry.target as HTMLElement
        t.classList.add('opacity-100', 'translate-y-0')
        t.classList.remove('opacity-0', 'translate-y-6')
        t.querySelectorAll<HTMLElement>('.reveal-stagger-item').forEach((child, i) => {
          child.style.transitionDelay = `${i * 0.07}s`
          child.classList.remove('opacity-0', 'translate-y-4')
          child.classList.add('opacity-100', 'translate-y-0')
        })
      })
    },
    { threshold: 0.08 },
  )
  el.querySelectorAll('.reveal-item').forEach((node) => revealObserver?.observe(node))
})

onUnmounted(() => revealObserver?.disconnect())

const values = [
  {
    num: '01',
    title: 'Governance is structural',
    desc: 'A workflow that cannot be audited, explained, or intervened upon is not ready for production. Every Volnux system is designed so governance is the path of least resistance — not an add-on, not a checkbox.',
    accent: '#6366f1',
    accentLight: '#4f46e5',
  },
  {
    num: '02',
    title: 'Decentralisation by default',
    desc: 'Central schedulers are single points of failure and single points of control. Every Volnux system operates without a coordinator — nodes negotiate, tasks self-route, failures self-heal without a command chain.',
    accent: '#8b5cf6',
    accentLight: '#7c3aed',
  },
  {
    num: '03',
    title: 'The definition is the documentation',
    desc: 'Separate docs always go stale. When the workflow definition itself is readable by any stakeholder, governance is self-maintaining as the system evolves. Pointy-lang is executable documentation.',
    accent: '#a855f7',
    accentLight: '#9333ea',
  },
  {
    num: '04',
    title: 'Infrastructure should be boring',
    desc: 'Workflow engines should be the least interesting part of your stack — reliable, transparent, invisible when things go well. Excitement in infrastructure is usually a symptom of something broken.',
    accent: '#10b981',
    accentLight: '#059669',
  },
  {
    num: '05',
    title: 'Open core, not open bait',
    desc: 'The runtime, the language, and the core execution model are and will remain open source. We make money on the managed cloud and enterprise governance — not by restricting the infrastructure itself.',
    accent: '#f59e0b',
    accentLight: '#d97706',
  },
]

const timeline = [
  {
    phase: 'The Problem',
    body: 'Every organisation running at scale is running on automation. Data pipelines orchestrate decisions worth millions. AI agents execute actions without supervision. Approval workflows route through five systems before reaching a human.',
    accent: '#ef4444',
    accentLight: '#dc2626',
  },
  {
    phase: 'The Insight',
    body: 'The infrastructure that runs all of this was designed for a world that no longer exists. Central schedulers built for batch ETL jobs are now expected to orchestrate AI inference pipelines. Workflow definitions live in source code that only senior engineers can read.',
    accent: '#6366f1',
    accentLight: '#4f46e5',
  },
  {
    phase: 'The Conviction',
    body: 'Volnux was founded to solve it — not with a better scheduler or a simpler SDK, but with a fundamentally different architecture. A decentralised P2P execution mesh. A purpose-built DSL readable by every stakeholder. OpenTelemetry tracing baked into every state transition. Governance that is structural, not bolted on.',
    accent: '#10b981',
    accentLight: '#059669',
  },
]

const team = [
  {
    initials: 'AL',
    name: 'Alex Lindgren',
    role: 'Founder & CEO',
    quote: 'Automation without governance is just technical debt with a production deployment.',
    accent: '#6366f1',
    accentLight: '#4f46e5',
  },
  {
    initials: 'MK',
    name: 'Mira Kovac',
    role: 'CTO',
    quote: 'Every layer from language to mesh is designed so the right thing is also the easy thing.',
    accent: '#8b5cf6',
    accentLight: '#7c3aed',
  },
  {
    initials: 'JR',
    name: 'Jordan Reyes',
    role: 'Head of Engineering',
    quote: 'The hardest problems in distributed systems are not speed or scale. They are understanding what happened, when, and why.',
    accent: '#a855f7',
    accentLight: '#9333ea',
  },
]

const partners = [
  { name: 'Quantico Finance', tag: 'Trading & Settlement' },
  { name: 'MedCore Systems', tag: 'Clinical Trial Automation' },
  { name: 'Atlas Manufacturing', tag: 'Supply Chain Orchestration' },
  { name: 'Verdant Data', tag: 'ETL & Streaming' },
  { name: 'Synthwave AI', tag: 'Agent Infrastructure' },
]

const tickerItems = [
  'Decentralised by Design',
  'Governance First',
  'Open Core',
  'Pointy-lang',
  'P2P Mesh',
  'EventHub Registry',
  'AI Agent Native',
  'OpenTelemetry Native',
  'Runtime Assembly',
  'Audit by Construction',
]

const statEl = ref<HTMLElement | null>(null)
const isVisible = ref(false)
const displayVals = ref(['0', '0', '0', '0'])

const statData = [
  { target: 2, suffix: '+', label: 'Years building' },
  { target: 5, suffix: '', label: 'Design partners' },
  { target: 12, suffix: '', label: 'Monthly pulls (M)', scalar: true },
  { target: 100, suffix: '%', label: 'Open source core' },
]

let statObserver: IntersectionObserver | null = null

onMounted(() => {
  if (statEl.value) {
    statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible.value) {
            isVisible.value = true
            const dur = 1800
            const start = performance.now()
            const tick = (now: number) => {
              const p = Math.min((now - start) / dur, 1)
              const e = 1 - Math.pow(1 - p, 3)
              statData.forEach((s, i) => {
                displayVals.value[i] = s.scalar
                  ? (e * s.target).toFixed(0) + s.suffix
                  : Math.floor(e * s.target) + s.suffix
              })
              if (p < 1) requestAnimationFrame(tick)
            }
            requestAnimationFrame(tick)
          }
        })
      },
      { threshold: 0.4 },
    )
    statObserver.observe(statEl.value)
  }
})

onUnmounted(() => statObserver?.disconnect())
</script>

<template>
  <main ref="mainEl" class="relative z-10 overflow-x-hidden bg-white transition-colors duration-300 dark:bg-vn-black">
    <!-- ═══ HERO ═══ -->
    <section
      ref="heroRef"
      @mousemove="handleMouseMove"
      class="relative flex min-h-[90vh] flex-col justify-center overflow-hidden"
    >
      <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 transition-colors duration-300 dark:from-vn-black dark:via-vn-surface2 dark:to-[#0f0f16]" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.08),transparent_50%)] transition-colors duration-300 dark:bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_50%)]" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.06),transparent_50%)] transition-colors duration-300 dark:bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.1),transparent_50%)]" />
      <div class="pointer-events-none absolute inset-0 z-10" :style="spotlightStyle" />
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:60px_60px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />

      <div class="vn-container relative z-20 py-28 sm:py-36 lg:py-44">
        <div class="grid grid-cols-1 gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-20">
          <div class="reveal-item max-w-3xl opacity-0 translate-y-6 transition-all duration-700">
            <div class="mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1.5 dark:border-indigo-500/30 dark:bg-indigo-500/10">
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75 dark:bg-vn-accent" />
                <span class="relative inline-flex h-2 w-2 rounded-full bg-indigo-500 dark:bg-vn-accent" />
              </span>
              <span class="text-sm font-medium text-indigo-700 dark:text-indigo-300">About Volnux</span>
            </div>

            <h1 class="font-display text-5xl font-bold leading-[0.88] tracking-tight text-slate-900 dark:text-vn-white sm:text-6xl md:text-7xl lg:text-[5.5rem] xl:text-8xl">
              <span class="block">BUILDING</span>
              <span class="block text-indigo-600 dark:text-vn-accent">THE OS FOR</span>
              <span class="block">OPERATIONS</span>
            </h1>

            <div class="mt-8 flex flex-wrap gap-8 sm:gap-10">
              <div v-for="s in [
                { v: '4', l: 'Stack layers' },
                { v: '0', l: 'Central schedulers' },
                { v: '1', l: 'DSL to learn' },
              ]" :key="s.l" class="flex items-center gap-3">
                <span class="font-display text-3xl font-bold tracking-tight text-indigo-600 dark:text-vn-accent sm:text-4xl">{{ s.v }}</span>
                <span class="h-6 w-px rotate-[20deg] bg-indigo-300 dark:bg-vn-accent/20" />
                <span class="font-mono text-2xs uppercase tracking-[0.1em] text-slate-500 dark:text-vn-muted">{{ s.l }}</span>
              </div>
            </div>
          </div>

          <div class="reveal-item opacity-0 translate-y-6 transition-all duration-700 [transition-delay:150ms] lg:self-center">
            <div class="relative">
              <div class="absolute -inset-1 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-violet-500/20 opacity-60 blur-xl dark:opacity-20" />
              <div class="relative rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl transition-colors duration-300 dark:border-slate-800 dark:bg-[#0d0d12] sm:p-10">
                <div class="absolute -top-px left-8 right-8 h-px bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent dark:via-vn-accent/40" />
                <p class="text-base leading-[1.75] text-slate-600 dark:text-slate-400 sm:text-lg">
                  Volnux is an infrastructure company founded on a single conviction: the tools for
                  business automation have not kept pace with the complexity of the businesses that
                  depend on them.
                </p>
                <p class="mt-4 text-base leading-[1.75] text-slate-600 dark:text-slate-400 sm:text-lg">
                  We are building the execution substrate that makes every workflow
                  <span class="font-semibold text-indigo-600 dark:text-indigo-400">readable</span>,
                  <span class="font-semibold text-violet-600 dark:text-violet-400">reliable</span>, and
                  <span class="font-semibold text-purple-600 dark:text-purple-400">governable</span> by design.
                </p>
                <div class="mt-6 flex items-center gap-2">
                  <span class="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                  <span class="font-mono text-2xs uppercase tracking-widest text-slate-400 dark:text-slate-600">est. 2024</span>
                  <span class="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ TICKER ═══ -->
    <div class="relative z-10 flex h-11 items-center overflow-hidden border-y border-indigo-200 bg-indigo-600 dark:border-vn-border dark:bg-vn-accent">
      <div class="animate-ticker flex whitespace-nowrap">
        <span v-for="(item, i) in [...tickerItems, ...tickerItems]" :key="i" class="flex items-center gap-4 px-8">
          <span class="font-mono text-xs font-semibold uppercase tracking-wider text-white/90">{{ item }}</span>
          <span class="text-xs text-white/30">◆</span>
        </span>
      </div>
    </div>

    <!-- ═══ ORIGIN TIMELINE ═══ -->
    <section class="relative border-b border-slate-200 bg-slate-50/80 transition-colors duration-300 dark:border-vn-border dark:bg-vn-surface/30">
      <div class="vn-container py-20 sm:py-28 lg:py-36">
        <div class="reveal-item mb-16 opacity-0 translate-y-6 transition-all duration-700">
          <span class="mb-4 inline-block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400">
            Origin
          </span>
          <h2 class="font-display text-4xl font-bold leading-[0.95] tracking-tight text-slate-900 dark:text-vn-white sm:text-5xl lg:text-6xl">
            WHY WE<br>
            <span class="text-indigo-600 dark:text-indigo-400">STARTED.</span>
          </h2>
        </div>

        <div class="relative ml-6 sm:ml-12">
          <div class="absolute left-0 top-0 h-full w-px bg-gradient-to-b from-rose-300 via-indigo-300 to-emerald-300 dark:from-rose-500/30 dark:via-indigo-500/30 dark:to-emerald-500/30" />

          <div class="space-y-12 sm:space-y-16">
            <div
              v-for="(step, i) in timeline"
              :key="i"
              class="reveal-item relative pl-10 opacity-0 translate-y-6 transition-all duration-700 sm:pl-14"
              :style="{ transitionDelay: `${i * 0.12}s` }"
            >
              <div class="absolute left-0 top-1 flex h-3 w-3 -translate-x-[6.5px] items-center justify-center">
                <span
                  class="absolute h-3 w-3 rounded-full opacity-30"
                  :style="{ backgroundColor: isDark ? step.accent : step.accentLight }"
                />
                <span
                  class="h-2 w-2 rounded-full ring-2 ring-white dark:ring-vn-black"
                  :style="{ backgroundColor: isDark ? step.accent : step.accentLight }"
                />
              </div>

              <div
                class="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/50 sm:p-8"
                :style="{ borderLeftColor: isDark ? step.accent : step.accentLight, borderLeftWidth: '3px' }"
              >
                <div class="mb-3 flex items-center gap-3">
                  <span
                    class="rounded-full px-2.5 py-0.5 font-mono text-2xs font-semibold uppercase tracking-wider text-white shadow-sm"
                    :style="{ backgroundColor: isDark ? step.accent : step.accentLight }"
                  >
                    {{ step.phase }}
                  </span>
                </div>
                <p class="text-base leading-[1.8] text-slate-600 dark:text-slate-400 sm:text-lg">
                  {{ step.body }}
                </p>
              </div>
            </div>
          </div>

          <div class="reveal-item relative mt-16 pl-10 opacity-0 translate-y-6 transition-all duration-700 sm:pl-14">
            <div class="absolute left-0 top-1 flex h-3 w-3 -translate-x-[6.5px] items-center justify-center">
              <span class="absolute h-3 w-3 rounded-full bg-indigo-400/30 dark:bg-vn-accent/30" />
              <span class="h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-vn-black dark:bg-vn-accent" />
            </div>
            <div class="rounded-xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-500/20 dark:bg-indigo-500/5 sm:p-8">
              <p class="font-display text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-vn-white sm:text-2xl">
                "The most expensive automation is the automation you cannot explain."
              </p>
              <cite class="mt-4 flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-indigo-600 not-italic dark:text-indigo-400">
                <span class="inline-block h-px w-8 bg-indigo-400 dark:bg-indigo-500/40" />
                Volnux founding thesis
              </cite>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ VALUES ═══ -->
    <section class="relative border-b border-slate-200 transition-colors duration-300 dark:border-vn-border">
      <div class="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white opacity-50 transition-colors duration-300 dark:from-vn-surface dark:via-vn-black dark:to-vn-black dark:opacity-100" />

      <div class="vn-container relative py-20 sm:py-28 lg:py-36">
        <div class="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <div class="reveal-item opacity-0 translate-y-6 transition-all duration-700 lg:sticky lg:top-28 lg:self-start">
            <span class="mb-5 inline-block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400">
              Values
            </span>
            <h2 class="font-display text-4xl font-bold leading-[0.95] tracking-tight text-slate-900 dark:text-vn-white sm:text-5xl lg:text-6xl">
              WHAT WE<br>
              <span class="text-indigo-600 dark:text-indigo-400">BELIEVE.</span>
            </h2>
            <div class="mt-6 h-px w-14 bg-indigo-400 dark:bg-indigo-500/40" />
            <p class="mt-6 text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
              These are not aspirational statements. They are constraints that shape every
              architectural decision, product priority, and partnership we choose.
            </p>
          </div>

          <div class="reveal-item opacity-0 translate-y-6 transition-all duration-700 [transition-delay:100ms]">
            <div class="space-y-4">
              <div
                v-for="(v, i) in values"
                :key="i"
                class="reveal-stagger-item group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-500 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-slate-700 sm:p-7"
              >
                <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-violet-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-indigo-500/5 dark:via-violet-500/5" />
                <div class="relative flex gap-4">
                  <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg font-mono text-2xs font-bold text-white shadow-sm transition-all duration-500 group-hover:scale-110"
                    :style="{ backgroundColor: isDark ? v.accent : v.accentLight }"
                  >
                    {{ v.num }}
                  </div>
                  <div>
                    <h3
                      class="mb-2 font-display text-base font-bold tracking-tight transition-colors sm:text-lg"
                      :style="{ color: isDark ? v.accent : v.accentLight }"
                    >
                      {{ v.title }}
                    </h3>
                    <p class="text-sm leading-[1.75] text-slate-500 dark:text-slate-400 sm:text-base">
                      {{ v.desc }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ STATS ═══ -->
    <section
      ref="statEl"
      class="relative overflow-hidden border-b border-slate-200 bg-indigo-50/60 transition-colors duration-300 dark:border-vn-border dark:bg-vn-accent/5"
    >
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden select-none">
        <span class="font-display text-[6rem] font-bold tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(99,102,241,0.12)] sm:text-[10rem] lg:text-[16rem] whitespace-nowrap dark:[-webkit-text-stroke:1px_rgba(99,102,241,0.04)]">
          VOLNUX
        </span>
      </div>

      <div class="vn-container relative z-10 py-16 sm:py-20">
        <div class="grid grid-cols-2 md:grid-cols-4">
          <div
            v-for="(stat, i) in statData"
            :key="i"
            class="relative border-r border-indigo-200/80 px-4 py-10 text-center last:border-r-0 dark:border-white/[0.06] sm:px-8"
          >
            <div class="font-display text-4xl font-bold tracking-tight text-indigo-700 dark:text-vn-accent sm:text-5xl md:text-6xl">
              {{ displayVals[i] }}
            </div>
            <div class="mt-2 font-mono text-2xs uppercase tracking-wider text-indigo-600/60 dark:text-white/40">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ TEAM ═══ -->
    <section class="relative border-b border-slate-200 transition-colors duration-300 dark:border-vn-border">
      <div class="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white opacity-50 transition-colors duration-300 dark:from-vn-black dark:via-vn-surface dark:to-vn-black dark:opacity-100" />

      <div class="vn-container relative py-20 sm:py-28 lg:py-36">
        <div class="reveal-item mb-16 opacity-0 translate-y-6 transition-all duration-700">
          <span class="mb-4 inline-block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400">
            Leadership
          </span>
          <h2 class="font-display text-4xl font-bold leading-[0.95] tracking-tight text-slate-900 dark:text-vn-white sm:text-5xl lg:text-6xl">
            WHO WE<br>
            <span class="text-indigo-600 dark:text-indigo-400">ARE.</span>
          </h2>
        </div>

        <div class="reveal-item opacity-0 translate-y-6 transition-all duration-700 [transition-delay:100ms]">
          <div class="grid grid-cols-1 gap-5 md:grid-cols-3">
            <div
              v-for="(t, i) in team"
              :key="i"
              class="reveal-stagger-item group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-8 shadow-sm transition-all duration-500 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900/30 sm:p-10"
            >
              <div
                class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100 dark:from-indigo-500/5 dark:to-violet-500/5"
              />
              <div
                class="absolute -top-px left-0 right-0 h-px opacity-40 transition-opacity duration-500 group-hover:opacity-100"
                :style="{ background: `linear-gradient(90deg, transparent, ${isDark ? t.accent : t.accentLight}, transparent)` }"
              />

              <div class="relative mb-6 flex items-center gap-5">
                <div
                  class="flex h-14 w-14 items-center justify-center rounded-xl text-lg font-bold shadow-sm transition-all duration-500 group-hover:scale-105 group-hover:shadow-md"
                  :style="{
                    backgroundColor: isDark ? `${t.accent}15` : `${t.accentLight}12`,
                    border: `1px solid ${isDark ? `${t.accent}30` : `${t.accentLight}25`}`,
                    color: isDark ? t.accent : t.accentLight,
                  }"
                >
                  {{ t.initials }}
                </div>
                <div>
                  <h3
                    class="font-display text-lg font-bold tracking-tight text-slate-900 transition-colors duration-500 group-hover:text-indigo-600 dark:text-vn-white dark:group-hover:text-indigo-400"
                  >
                    {{ t.name }}
                  </h3>
                  <p class="font-mono text-2xs uppercase tracking-wider text-slate-500 dark:text-slate-500">{{ t.role }}</p>
                </div>
              </div>

              <div class="relative border-t border-slate-200 pt-5 dark:border-slate-800">
                <p class="text-sm leading-[1.75] italic text-slate-500 dark:text-slate-500">"{{ t.quote }}"</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ PARTNERS ═══ -->
    <section class="relative border-b border-slate-200 bg-slate-50/80 transition-colors duration-300 dark:border-vn-border dark:bg-vn-surface/20">
      <div class="vn-container py-20 sm:py-28 lg:py-36">
        <div class="reveal-item mx-auto mb-14 max-w-xl text-center opacity-0 translate-y-6 transition-all duration-700">
          <span class="mb-4 inline-block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400">
            Partners
          </span>
          <h2 class="font-display text-4xl font-bold leading-[0.95] tracking-tight text-slate-900 dark:text-vn-white sm:text-5xl lg:text-6xl">
            DESIGN<br>
            <span class="text-indigo-600 dark:text-indigo-400">PARTNERS.</span>
          </h2>
          <p class="mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
            Organisations that deploy Volnux in production environments where reliability,
            auditability, and governance are non-negotiable.
          </p>
        </div>

        <div class="reveal-item opacity-0 translate-y-6 transition-all duration-700 [transition-delay:100ms]">
          <div class="grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <div
              v-for="(p, i) in partners"
              :key="i"
              class="reveal-stagger-item group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-7 text-center shadow-sm transition-all duration-500 hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/20 dark:hover:border-indigo-500/30 sm:p-8"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              <div class="relative">
                <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-100 font-display text-base font-bold text-indigo-600 transition-all duration-500 group-hover:scale-110 group-hover:bg-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-400 dark:group-hover:bg-indigo-500/20">
                  {{ p.name.charAt(0) }}
                </div>
                <h4 class="mb-0.5 font-display text-sm font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-vn-white dark:group-hover:text-indigo-400">
                  {{ p.name }}
                </h4>
                <p class="font-mono text-2xs uppercase tracking-wider text-slate-500 dark:text-slate-500">{{ p.tag }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ CTA ═══ -->
    <section class="relative overflow-hidden py-24 sm:py-32">
      <div class="absolute inset-0 bg-gradient-to-b from-white via-indigo-50/30 to-white opacity-50 transition-colors duration-300 dark:from-vn-black dark:via-vn-surface dark:to-vn-black dark:opacity-100" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.1),transparent_70%)]" />

      <div class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div class="h-[400px] w-[400px] animate-[pulse_6s_ease-in-out_infinite] rounded-full border border-indigo-200/50 dark:border-vn-accent/10" />
        <div class="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 animate-[pulse_6s_ease-in-out_infinite_1s] rounded-full border border-violet-200/50 dark:border-vn-accent2/10" />
        <div class="absolute left-1/2 top-1/2 h-[160px] w-[160px] -translate-x-1/2 -translate-y-1/2 animate-[pulse_6s_ease-in-out_infinite_2s] rounded-full border border-purple-200/50 dark:border-vn-accent3/10" />
      </div>

      <div class="pointer-events-none absolute left-1/4 top-1/3 h-[300px] w-[300px] rounded-full bg-indigo-200/30 blur-[120px] dark:bg-vn-accent/10" />
      <div class="pointer-events-none absolute bottom-1/3 right-1/4 h-[250px] w-[250px] rounded-full bg-violet-200/30 blur-[100px] dark:bg-vn-accent2/10" />

      <div class="vn-container relative z-10">
        <div class="reveal-item mx-auto max-w-xl text-center opacity-0 translate-y-6 transition-all duration-700">
          <span class="mb-5 inline-block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-indigo-400">
            Get involved
          </span>
          <h2 class="font-display text-4xl font-bold leading-[0.95] tracking-tight text-slate-900 dark:text-vn-white sm:text-5xl lg:text-6xl">
            BUILD WITH<br>
            <span class="text-indigo-600 dark:text-indigo-400">US.</span>
          </h2>
          <p class="mb-10 mt-6 text-sm leading-relaxed text-slate-600 dark:text-slate-400 sm:text-base">
            Whether you want to adopt Volnux, contribute to the open-source core, or explore
            partnership opportunities — we would love to hear from you.
          </p>
          <div class="flex flex-wrap justify-center gap-3">
            <a
              href="mailto:hello@volnux.ai"
              class="group inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40 dark:bg-vn-accent dark:text-vn-black dark:hover:bg-indigo-400"
            >
              hello@volnux.ai
              <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a
              href="/"
              class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/50 px-6 py-3 text-sm font-medium text-slate-700 backdrop-blur-sm transition-all hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-indigo-500/50 dark:hover:text-white"
            >
              Explore the platform
            </a>
            <a
              href="/docs"
              class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-6 py-3 text-sm font-medium text-slate-500 transition-all hover:border-indigo-300 hover:text-indigo-600 dark:border-indigo-500/20 dark:text-indigo-400/70 dark:hover:border-indigo-500/40 dark:hover:text-indigo-400"
            >
              Read the docs
            </a>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
@keyframes ticker {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.animate-ticker {
  animation: ticker 40s linear infinite;
}
</style>
