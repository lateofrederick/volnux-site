<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()

const mainEl = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const gridStyle = computed(() => ({
  backgroundImage: isDark.value
    ? 'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)'
    : 'linear-gradient(rgba(99,102,241,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.06) 1px, transparent 1px)',
  backgroundSize: '56px 56px',
}))

const maskStyle = computed(() => ({
  WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 70%, black, transparent)',
  maskImage: 'radial-gradient(ellipse 80% 60% at 50% 70%, black, transparent)',
}))

onMounted(() => {
  const el = mainEl.value
  if (!el) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          (e.target as HTMLElement).classList.add('on')
        }
      })
    },
    { threshold: 0.15 }
  )

  el.querySelectorAll<HTMLElement>('.vn-reveal, .reveal-stagger').forEach((node) => {
    observer?.observe(node)
  })
})

onUnmounted(() => observer?.disconnect())

const values = [
  {
    num: '01',
    title: 'Governance is structural',
    desc: 'A workflow that cannot be audited, explained, or intervened upon is not ready for production. Every Volnux system is designed so governance is the path of least resistance — not an add-on, not a checkbox.',
  },
  {
    num: '02',
    title: 'Decentralisation by default',
    desc: 'Central schedulers are single points of failure and single points of control. Every Volnux system operates without a coordinator — nodes negotiate, tasks self-route, failures self-heal without a command chain.',
  },
  {
    num: '03',
    title: 'The definition is the documentation',
    desc: 'Separate docs always go stale. When the workflow definition itself is readable by any stakeholder, governance is self-maintaining as the system evolves. Pointy-lang is executable documentation.',
  },
  {
    num: '04',
    title: 'Infrastructure should be boring',
    desc: 'Workflow engines should be the least interesting part of your stack — reliable, transparent, invisible when things go well. Excitement in infrastructure is usually a symptom of something broken.',
  },
  {
    num: '05',
    title: 'Open core, not open bait',
    desc: 'The runtime, the language, and the core execution model are and will remain open source. We make money on the managed cloud and enterprise governance — not by restricting the infrastructure itself.',
  },
]

const team = [
  {
    initials: 'AL',
    name: 'Alex Lindgren',
    role: 'Founder & CEO',
    quote: 'Automation without governance is just technical debt with a production deployment.',
  },
  {
    initials: 'MK',
    name: 'Mira Kovac',
    role: 'CTO',
    quote: 'Every layer from language to mesh is designed so the right thing is also the easy thing.',
  },
  {
    initials: 'JR',
    name: 'Jordan Reyes',
    role: 'Head of Engineering',
    quote: 'The hardest problems in distributed systems are not speed or scale. They are understanding what happened, when, and why.',
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
  'Decentralised by Design', 'Governance First', 'Open Core', 'Pointy-lang',
  'P2P Mesh', 'EventHub Registry', 'AI Agent Native', 'OpenTelemetry Native',
  'Runtime Assembly', 'Audit by Construction',
]

const isVisible = ref(false)
const statEl = ref<HTMLElement | null>(null)
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
    statObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isVisible.value) {
          isVisible.value = true
          const dur = 1800; const start = performance.now()
          const tick = (now: number) => {
            const p = Math.min((now - start) / dur, 1); const e = 1 - Math.pow(1 - p, 3)
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
    }, { threshold: 0.4 })
    statObserver.observe(statEl.value)
  }
})

onUnmounted(() => statObserver?.disconnect())
</script>

<template>
  <main ref="mainEl" class="relative z-10">
    <!-- ═══ HERO ═══ -->
    <section class="relative flex min-h-[85vh] flex-col justify-end overflow-hidden border-b border-slate-200 dark:border-vn-border">
      <div class="pointer-events-none absolute inset-0 z-0" :style="[gridStyle, maskStyle]" />

      <div class="pointer-events-none absolute -left-48 top-1/4 h-[500px] w-[500px] rounded-full bg-indigo-500/5 blur-[140px] dark:bg-vn-accent/5" />
      <div class="pointer-events-none absolute -right-48 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-500/5 blur-[120px] dark:bg-vn-accent2/5" />

      <div class="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-white via-transparent to-white/40 dark:from-vn-black dark:via-transparent dark:to-vn-black/60" />

      <div class="vn-container relative z-10 pb-20 pt-36 sm:pb-24 sm:pt-44 lg:pb-28">
        <div class="max-w-4xl">
          <div class="vn-reveal mb-8 flex items-center gap-4">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-500 opacity-75 dark:bg-vn-accent" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-indigo-600 dark:bg-vn-accent" />
            </span>
            <span class="h-px w-10 bg-indigo-600/40 dark:bg-vn-accent/40" />
            <span class="font-mono text-xs font-medium uppercase tracking-[0.15em] text-indigo-600 dark:text-vn-accent">About Volnux</span>
          </div>

          <h1 class="vn-reveal mb-6 font-display text-5xl font-bold leading-[0.92] tracking-tight text-slate-900 dark:text-vn-white sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl">
            <span class="block">BUILDING THE</span>
            <span class="block text-indigo-600 dark:text-vn-accent">OPERATING SYSTEM</span>
            <span class="block text-slate-500 dark:text-vn-white/80">FOR OPERATIONS</span>
          </h1>

          <p class="vn-reveal mb-10 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-vn-text2/70 sm:text-lg">
            Volnux is an infrastructure company founded on a single conviction: the tools for
            business automation have not kept pace with the complexity of the businesses that
            depend on them. We are building the execution substrate that makes every workflow
            readable, reliable, and governable by design.
          </p>

          <div class="vn-reveal flex flex-wrap gap-10">
            <div v-for="s in [
              { v: '4', l: 'Stack layers' },
              { v: '0', l: 'Central schedulers' },
              { v: '1', l: 'DSL to learn' },
            ]" :key="s.l" class="flex items-center gap-3">
              <span class="font-display text-3xl font-bold tracking-tight text-slate-900 dark:text-vn-white sm:text-4xl">{{ s.v }}</span>
              <span class="h-6 w-px rotate-[15deg] bg-indigo-600/20 dark:bg-vn-accent/20" />
              <span class="font-mono text-2xs uppercase tracking-[0.1em] text-slate-500 dark:text-vn-muted">{{ s.l }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ TICKER ═══ -->
    <div class="relative z-10 flex h-10 items-center overflow-hidden border-b border-slate-200 bg-indigo-600 dark:border-vn-border dark:bg-vn-accent">
      <div class="animate-ticker flex whitespace-nowrap">
        <span v-for="(item, i) in [...tickerItems, ...tickerItems]" :key="i" class="flex items-center gap-4 px-8">
          <span class="font-mono text-xs font-semibold uppercase tracking-wider text-white/90">{{ item }}</span>
          <span class="text-xs text-white/40">◆</span>
        </span>
      </div>
    </div>

    <!-- ═══ STORY ═══ -->
    <section class="relative border-b border-slate-200 bg-slate-50/50 dark:border-vn-border dark:bg-vn-surface/50">
      <div class="vn-container py-20 sm:py-28 lg:py-36">
        <div class="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div class="vn-reveal lg:sticky lg:top-28 lg:self-start">
            <span class="mb-5 inline-block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-vn-accent">
              Origin
            </span>
            <h2 class="font-display text-4xl font-bold leading-[0.95] tracking-tight text-slate-900 dark:text-vn-white sm:text-5xl lg:text-6xl">
              WHY WE<br>
              <span class="text-indigo-600 dark:text-vn-accent">STARTED.</span>
            </h2>
            <div class="mt-6 h-px w-14 bg-indigo-600/40 dark:bg-vn-accent/40" />
            <p class="mt-6 text-sm leading-relaxed text-slate-500 dark:text-vn-muted sm:text-base">
              A founding story in three acts.
            </p>
          </div>

          <div class="space-y-6 text-base leading-relaxed text-slate-600 dark:text-vn-text2/70 sm:text-lg">
            <p class="vn-reveal text-lg font-medium leading-relaxed text-slate-800 dark:text-vn-text2/90 sm:text-xl">
              Every organisation running at scale is running on automation. Data pipelines
              orchestrate decisions worth millions. AI agents execute actions without
              supervision. Approval workflows route through five systems before reaching a human.
            </p>

            <div class="vn-reveal my-10 rounded-lg border border-indigo-600/10 bg-indigo-600/5 p-6 dark:border-vn-accent/10 dark:bg-vn-accent/5 sm:p-8">
              <p class="font-display text-lg font-bold leading-snug tracking-tight text-slate-900 dark:text-vn-white sm:text-xl">
                "The infrastructure that runs all of this was designed for a world that no longer exists."
              </p>
            </div>

            <p class="vn-reveal">
              Central schedulers built for batch ETL jobs are now expected to orchestrate
              AI inference pipelines. Workflow definitions live in source code that only
              senior engineers can read. This is not an engineering problem. It is a design problem.
            </p>

            <p class="vn-reveal">
              Volnux was founded to solve it — not with a better scheduler or a simpler SDK,
              but with a fundamentally different architecture. A decentralised P2P execution
              mesh. A purpose-built DSL readable by every stakeholder. OpenTelemetry tracing
              baked into every state transition. Governance that is structural, not bolted on.
            </p>

            <div class="vn-reveal mt-10 border-l-4 border-indigo-600/60 pl-6 dark:border-vn-accent/60">
              <p class="font-display text-xl font-bold leading-tight tracking-tight text-slate-900 dark:text-vn-white sm:text-2xl">
                "The most expensive automation is the automation you cannot explain."
              </p>
              <cite class="mt-3 flex items-center gap-3 font-mono text-xs uppercase tracking-wider text-slate-500 not-italic dark:text-vn-muted">
                <span class="inline-block h-px w-6 bg-slate-400/50 dark:bg-vn-muted/50" />
                Volnux founding thesis
              </cite>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ VALUES ═══ -->
    <section class="relative border-b border-slate-200 dark:border-vn-border">
      <div class="vn-container py-20 sm:py-28 lg:py-36">
        <div class="grid grid-cols-1 gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
          <div class="vn-reveal lg:sticky lg:top-28 lg:self-start">
            <span class="mb-5 inline-block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-vn-accent">
              Values
            </span>
            <h2 class="font-display text-4xl font-bold leading-[0.95] tracking-tight text-slate-900 dark:text-vn-white sm:text-5xl lg:text-6xl">
              WHAT WE<br>
              <span class="text-indigo-600 dark:text-vn-accent">BELIEVE.</span>
            </h2>
            <div class="mt-6 h-px w-14 bg-indigo-600/40 dark:bg-vn-accent/40" />
            <p class="mt-6 text-sm leading-relaxed text-slate-500 dark:text-vn-muted sm:text-base">
              These are not aspirational statements. They are constraints that shape every
              architectural decision, product priority, and partnership we choose.
            </p>
          </div>

          <div class="reveal-stagger flex flex-col divide-y divide-slate-200 dark:divide-vn-border">
            <div
              v-for="(v, i) in values"
              :key="i"
              class="group py-7 first:pt-0 last:pb-0 sm:py-8"
            >
              <div class="flex items-start gap-5 sm:gap-6">
                <span class="hidden shrink-0 font-mono text-sm font-medium text-slate-400 dark:text-vn-muted sm:block sm:w-8">{{ v.num }}</span>
                <div>
                  <h3 class="mb-1.5 font-display text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-vn-white dark:group-hover:text-vn-accent sm:text-xl">
                    {{ v.title }}
                  </h3>
                  <p class="text-sm leading-relaxed text-slate-600 dark:text-vn-muted sm:text-base">{{ v.desc }}</p>
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
      class="relative overflow-hidden border-b border-slate-200 bg-indigo-600/5 py-16 dark:border-vn-border dark:bg-vn-accent/5 sm:py-20"
    >
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden">
        <span class="font-display text-[6rem] font-bold tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(99,102,241,0.08)] dark:[-webkit-text-stroke:1px_rgba(99,102,241,0.06)] sm:text-[10rem] lg:text-[16rem] whitespace-nowrap">
          VOLNUX
        </span>
      </div>

      <div class="vn-container relative z-10">
        <div class="grid grid-cols-2 gap-0 md:grid-cols-4">
          <div
            v-for="(stat, i) in statData"
            :key="i"
            class="border-r border-indigo-600/15 px-4 py-8 text-center last:border-r-0 dark:border-white/10 sm:px-8 sm:py-10"
          >
            <div class="font-display text-4xl font-bold tracking-tight text-indigo-700 dark:text-vn-accent sm:text-5xl md:text-6xl">
              {{ displayVals[i] }}
            </div>
            <div class="mt-2 font-mono text-2xs uppercase tracking-wider text-slate-500 dark:text-white/50">{{ stat.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ TEAM ═══ -->
    <section class="relative border-b border-slate-200 dark:border-vn-border">
      <div class="vn-container py-20 sm:py-28 lg:py-36">
        <div class="vn-reveal mb-14">
          <span class="mb-5 inline-block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-vn-accent">
            Leadership
          </span>
          <h2 class="font-display text-4xl font-bold leading-[0.95] tracking-tight text-slate-900 dark:text-vn-white sm:text-5xl lg:text-6xl">
            WHO WE<br>
            <span class="text-indigo-600 dark:text-vn-accent">ARE.</span>
          </h2>
        </div>

        <div class="reveal-stagger grid grid-cols-1 gap-4 md:grid-cols-3">
          <div
            v-for="(t, i) in team"
            :key="i"
            class="group relative rounded-xl border border-slate-200 bg-white p-8 transition-all duration-500 hover:-translate-y-0.5 hover:border-indigo-600/20 hover:shadow-lg dark:border-vn-border dark:bg-vn-surface/50 dark:hover:border-vn-accent/20 sm:p-10"
          >
            <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 font-display text-lg font-bold text-indigo-600 transition-all duration-500 group-hover:border-indigo-600/30 group-hover:bg-indigo-600/5 group-hover:shadow-sm dark:border-vn-border2 dark:bg-vn-surface2 dark:text-vn-accent dark:group-hover:border-vn-accent/30 dark:group-hover:bg-vn-accent/5">
              {{ t.initials }}
            </div>

            <h3 class="mb-1 font-display text-lg font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-vn-white dark:group-hover:text-vn-accent">
              {{ t.name }}
            </h3>
            <p class="mb-5 font-mono text-xs uppercase tracking-wider text-slate-500 dark:text-vn-muted">{{ t.role }}</p>

            <div class="border-t border-slate-200 pt-5 dark:border-vn-border">
              <p class="text-sm leading-relaxed italic text-slate-600 dark:text-vn-text2/60">"{{ t.quote }}"</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ PARTNERS ═══ -->
    <section class="relative border-b border-slate-200 bg-slate-50/50 dark:border-vn-border dark:bg-vn-surface/30">
      <div class="vn-container py-20 sm:py-28 lg:py-36">
        <div class="vn-reveal mx-auto mb-14 max-w-xl text-center">
          <span class="mb-5 inline-block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-vn-accent">
            Partners
          </span>
          <h2 class="font-display text-4xl font-bold leading-[0.95] tracking-tight text-slate-900 dark:text-vn-white sm:text-5xl lg:text-6xl">
            DESIGN<br>
            <span class="text-indigo-600 dark:text-vn-accent">PARTNERS.</span>
          </h2>
          <p class="mt-4 text-sm leading-relaxed text-slate-600 dark:text-vn-muted sm:text-base">
            Organisations that deploy Volnux in production environments where reliability,
            auditability, and governance are non-negotiable.
          </p>
        </div>

        <div class="reveal-stagger grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <div
            v-for="(p, i) in partners"
            :key="i"
            class="group rounded-xl border border-slate-200 bg-white p-7 text-center transition-all duration-500 hover:-translate-y-0.5 hover:border-indigo-600/20 hover:shadow-md dark:border-vn-border/50 dark:bg-vn-black/30 dark:hover:border-vn-accent/20 sm:p-8"
          >
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 font-display text-base font-bold text-indigo-600 transition-all duration-500 group-hover:border-indigo-600/30 group-hover:bg-indigo-600/5 group-hover:scale-105 dark:border-vn-border2 dark:bg-vn-surface2 dark:text-vn-accent dark:group-hover:border-vn-accent/30 dark:group-hover:bg-vn-accent/5">
              {{ p.name.charAt(0) }}
            </div>
            <h4 class="mb-0.5 font-display text-sm font-bold tracking-tight text-slate-900 transition-colors group-hover:text-indigo-600 dark:text-vn-white dark:group-hover:text-vn-accent">{{ p.name }}</h4>
            <p class="font-mono text-2xs uppercase tracking-wider text-slate-500 dark:text-vn-muted">{{ p.tag }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ CTA ═══ -->
    <section class="relative overflow-hidden py-24 text-center sm:py-32">
      <div class="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        <div class="h-[400px] w-[400px] rounded-full border border-indigo-600/5 dark:border-vn-accent/8" />
        <div class="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-600/5 dark:border-vn-accent2/8" />
        <div class="absolute left-1/2 top-1/2 h-[160px] w-[160px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-fuchsia-600/5 dark:border-vn-accent3/8" />
      </div>

      <div class="vn-container relative z-10">
        <div class="vn-reveal mx-auto max-w-xl">
          <span class="mb-5 inline-block font-mono text-xs font-semibold uppercase tracking-[0.12em] text-indigo-600 dark:text-vn-accent">
            Get involved
          </span>
          <h2 class="font-display text-4xl font-bold leading-[0.95] tracking-tight text-slate-900 dark:text-vn-white sm:text-5xl lg:text-6xl">
            BUILD WITH<br>
            <span class="text-indigo-600 dark:text-vn-accent">US.</span>
          </h2>
          <p class="mb-10 mt-6 text-sm leading-relaxed text-slate-600 dark:text-vn-muted sm:text-base">
            Whether you want to adopt Volnux, contribute to the open-source core, or explore
            partnership opportunities — we would love to hear from you.
          </p>
          <div class="flex flex-wrap justify-center gap-3">
            <a href="mailto:hello@volnux.ai" class="group inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-600/40 dark:bg-vn-accent dark:text-vn-black dark:hover:bg-indigo-400">
              hello@volnux.ai
              <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
            <a href="/" class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/50 px-6 py-3 text-sm font-medium text-slate-700 backdrop-blur-sm transition-all hover:border-indigo-600/50 hover:text-indigo-600 dark:border-vn-border2 dark:bg-vn-surface/50 dark:text-vn-text2/70 dark:hover:border-vn-accent/30 dark:hover:text-vn-white">
              Explore the platform
            </a>
            <a href="/docs" class="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-6 py-3 text-sm font-medium text-slate-500 transition-all hover:border-indigo-600/30 hover:text-indigo-600 dark:border-vn-accent/10 dark:text-vn-accent/70 dark:hover:border-vn-accent/30 dark:hover:text-vn-accent">
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

.vn-reveal {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s cubic-bezier(0.16, 1, 0.3, 1), transform 0.7s cubic-bezier(0.16, 1, 0.3, 1);
}
.vn-reveal.on {
  opacity: 1;
  transform: translateY(0);
}

.reveal-stagger > * {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1), transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}
.reveal-stagger.on > *:nth-child(1) { opacity: 1; transform: none; transition-delay: 0s; }
.reveal-stagger.on > *:nth-child(2) { opacity: 1; transform: none; transition-delay: 0.07s; }
.reveal-stagger.on > *:nth-child(3) { opacity: 1; transform: none; transition-delay: 0.14s; }
.reveal-stagger.on > *:nth-child(4) { opacity: 1; transform: none; transition-delay: 0.21s; }
.reveal-stagger.on > *:nth-child(5) { opacity: 1; transform: none; transition-delay: 0.28s; }
</style>