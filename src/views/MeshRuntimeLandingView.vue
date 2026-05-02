<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()

const mainEl = ref<HTMLElement | null>(null)
const heroRef = ref<HTMLElement | null>(null)
const mouseX = ref(0)
const mouseY = ref(0)
const activeStep = ref(0)

const spotlightStyle = computed(() => {
  const color = isDark.value ? '16, 185, 129' : '5, 150, 105'
  const opacity = isDark.value ? '0.12' : '0.14'
  const size = isDark.value ? '900px' : '700px'
  return {
    background: `radial-gradient(${size} circle at ${mouseX.value}px ${mouseY.value}px, rgba(${color}, ${opacity}), rgba(${color}, ${isDark.value ? '0.03' : '0.06'}) 40%, transparent 70%)`,
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

const heroStats = [
  { value: '0', label: 'Coordinator overhead' },
  { value: '∞', label: 'Horizontal scale' },
  { value: '0', label: 'Single points of failure' },
]

const steps = [
  {
    num: '01',
    title: 'Node Discovery',
    desc: 'New nodes broadcast their presence over the mesh. Existing peers respond with topology metadata. No registry. No seed server. The mesh self-assembles.',
    code: '<span class="text-emerald-400">$</span> <span class="text-teal-300">volnux</span> <span class="text-cyan-400">mesh</span> join --advertise <span class="text-amber-300">"accra-dw"</span>',
  },
  {
    num: '02',
    title: 'mTLS Handshake',
    desc: 'Every link is mutually authenticated before a single byte of payload crosses. Certificate rotation happens live without dropping connections.',
    code: '<span class="text-emerald-400">🔒</span> <span class="text-teal-300">mTLS</span> negotiated <span class="text-cyan-400">↔</span> peer <span class="text-amber-300">"lagos-api"</span> <span class="text-emerald-400">✓</span>',
  },
  {
    num: '03',
    title: 'Task Dispatch',
    desc: 'The runtime reads node and executor annotations from your Pointy-lang workflow and routes each task to the correct peer or Celery worker automatically.',
    code: '<span class="text-teal-300">pypi</span><span class="text-amber-300">:Extract@v2.1</span><span class="text-amber-300">[node=<span class="text-pink-300">"accra-dw"</span>]</span> <span class="text-emerald-400">→ dispatched</span>',
  },
  {
    num: '04',
    title: 'Failure Recovery',
    desc: 'The watchdog detects dead links in real time. Failed tasks rehydrate from their last checkpoint on any available node. No human intervention required.',
    code: '<span class="text-red-400">✗</span> node lost → <span class="text-emerald-400">rehydrating</span> from checkpoint <span class="text-cyan-400">@step3</span> <span class="text-emerald-400">✓</span>',
  },
]

const capabilityAccentMap: Record<string, { top: string; iconBg: string; iconBorder: string; iconColor: string }> = {
  p2p: { top: '#10b981', iconBg: 'rgba(16,185,129,0.1)', iconBorder: 'rgba(16,185,129,0.2)', iconColor: '#10b981' },
  context: { top: '#14b8a6', iconBg: 'rgba(20,184,166,0.1)', iconBorder: 'rgba(20,184,166,0.2)', iconColor: '#14b8a6' },
  checkpoint: { top: '#06b6d4', iconBg: 'rgba(6,182,212,0.1)', iconBorder: 'rgba(6,182,212,0.2)', iconColor: '#06b6d4' },
  dispatch: { top: '#f59e0b', iconBg: 'rgba(245,158,11,0.1)', iconBorder: 'rgba(245,158,11,0.2)', iconColor: '#f59e0b' },
  mtls: { top: '#10b981', iconBg: 'rgba(16,185,129,0.1)', iconBorder: 'rgba(16,185,129,0.2)', iconColor: '#10b981' },
  otel: { top: '#14b8a6', iconBg: 'rgba(20,184,166,0.1)', iconBorder: 'rgba(20,184,166,0.2)', iconColor: '#14b8a6' },
}

const capabilities = [
  { key: 'p2p', icon: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93z', title: 'Peer-to-peer topology', desc: 'No master node. No coordinator process. Every Volnux node is a full peer. The mesh routes, balances, and heals without centralised coordination.' },
  { key: 'context', icon: 'M4 6h16M4 12h16M4 18h10', title: 'Adaptive mini-context', desc: 'Execution state switches between small, batch, and aggregate modes automatically. Large workloads stream their results without memory pressure on any node.' },
  { key: 'checkpoint', icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', title: 'Checkpoint rehydration', desc: "Every task is checkpointed at execution boundaries. A failed node's work rehydrates on any healthy peer. Workflows never restart from zero." },
  { key: 'dispatch', icon: 'M13 10V3L4 14h7v7l9-11h-7z', title: 'Multi-executor dispatch', desc: 'Route tasks to mesh nodes, Celery workers, or local processes — all from Pointy-lang annotations. No custom routing code required.' },
  { key: 'mtls', icon: 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z', title: 'mTLS by default', desc: 'Every inter-node connection is mutually authenticated. Certificate rotation happens live. Zero-trust networking with no extra configuration.' },
  { key: 'otel', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', title: 'OTEL telemetry', desc: 'Every packet, every state transition, every retry is traced with OpenTelemetry. Full distributed trace across the entire mesh without instrumentation overhead.' },
]

const dispatchTargets = [
  { accent: '#10b981', title: 'Mesh Node', desc: 'Dispatch to any peer in the cluster by node ID', tag: 'node="accra-dw"' },
  { accent: '#14b8a6', title: 'Celery Worker', desc: 'Route to Celery workers via Redis or RabbitMQ', tag: 'executor="celery"' },
  { accent: '#06b6d4', title: 'Local Process', desc: 'Execute on the current node with default executor', tag: 'local' },
  { accent: '#f59e0b', title: 'GPU Cluster', desc: 'Pin compute-heavy AI tasks to GPU-equipped peers', tag: 'node="gpu-cluster"' },
]

const tickerSnippets = [
  { parts: [{ t: 'nd', v: 'Extract' }, { t: 'arr', v: ' -> ' }, { t: 'nd', v: 'Process' }, { t: 'arr', v: ' -> ' }, { t: 'nd', v: 'Load' }] },
  { parts: [{ t: 'nd', v: 'Ingest' }, { t: 'ann', v: '[node=' }, { t: 'str', v: '"accra-dw"' }, { t: 'ann', v: ']' }, { t: 'arr', v: ' -> ' }, { t: 'nd', v: 'Validate' }] },
  { parts: [{ t: 'nd', v: 'EnrichWithAI' }, { t: 'ann', v: '[executor=' }, { t: 'str', v: '"celery"' }, { t: 'ann', v: ']' }, { t: 'rt', v: ' * 3' }] },
  { parts: [{ t: 'nd', v: 'KafkaIngest' }, { t: 'op', v: ' |-> ' }, { t: 'meta', v: 'MAP' }, { t: 'ann', v: '<Validate>' }, { t: 'op', v: ' || ' }, { t: 'nd', v: 'Checkpoint' }] },
  { parts: [{ t: 'nd', v: 'Process' }, { t: 'txt', v: '(' }, { t: 'meta', v: 'success' }, { t: 'arr', v: ' -> ' }, { t: 'nd', v: 'Store' }, { t: 'txt', v: ', ' }, { t: 'meta', v: 'failure' }, { t: 'arr', v: ' -> ' }, { t: 'nd', v: 'Quarantine' }, { t: 'txt', v: ')' }] },
  { parts: [{ t: 'nd', v: 'Classify' }, { t: 'arr', v: ' -> ' }, { t: 'nd', v: 'RouteAgent' }, { t: 'ann', v: '[node=' }, { t: 'str', v: '"gpu-cluster"' }, { t: 'ann', v: ']' }] },
]
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
      <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-emerald-50/20 transition-colors duration-300 dark:from-[#0a0a0f] dark:via-[#12121a] dark:to-[#0f0f16]" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.08),transparent_50%)] transition-colors duration-300 dark:bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.12),transparent_50%)]" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.05),transparent_50%)] transition-colors duration-300 dark:bg-[radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.08),transparent_50%)]" />

      <div class="pointer-events-none absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full transition-opacity duration-300" style="background: radial-gradient(circle, rgba(16,185,129,0.10) 0%, transparent 65%);" />
      <div class="pointer-events-none absolute bottom-0 right-[5%] h-[500px] w-[500px] rounded-full transition-opacity duration-300" style="background: radial-gradient(circle, rgba(20,184,166,0.08) 0%, transparent 65%);" />

      <div class="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300" :style="spotlightStyle" />

      <div class="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:28px_28px] dark:bg-[radial-gradient(rgba(255,255,255,0.025)_1px,transparent_1px)] dark:bg-[size:28px_28px]" />

      <div class="relative z-20 mx-auto w-full max-w-7xl">
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <div class="reveal-item mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 dark:border-emerald-500/30 dark:bg-emerald-500/10">
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span class="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              <span class="text-sm font-medium text-emerald-700 dark:text-emerald-300">Volnux — Mesh Runtime</span>
            </div>

            <h1 class="reveal-item mb-6 font-display text-5xl font-bold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
              No master.<br />
              <span class="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400">No bottleneck.</span><br />
              No limits.
            </h1>

            <p class="reveal-item mb-8 text-lg leading-relaxed text-slate-600 dark:text-slate-400 sm:text-xl">
              The Volnux Mesh Runtime is a fully decentralised
              <span class="font-medium text-emerald-600 dark:text-emerald-400">P2P execution layer</span>.
              Every node is equal. Tasks route themselves. The cluster heals itself.
            </p>

            <div class="reveal-item mb-10 flex flex-col gap-3 sm:flex-row">
              <a href="#" class="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40">
                <span class="relative z-10">Get early access</span>
                <svg class="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
              <a href="#architecture" class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/50 px-6 py-3 text-base font-medium text-slate-700 backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:text-emerald-400">
                Explore the mesh →
              </a>
            </div>

            <div class="reveal-item flex gap-8 border-t border-slate-200 pt-6 dark:border-slate-800">
              <div v-for="stat in heroStats" :key="stat.label">
                <div class="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                  {{ stat.value }}<span v-if="stat.value === '0'" class="text-emerald-500">0</span><span v-if="stat.value === '∞'" class="text-emerald-500">∞</span>
                </div>
                <div class="text-sm text-slate-500 dark:text-slate-500">{{ stat.label }}</div>
              </div>
            </div>
          </div>

          <!-- Right: Mesh Topology Visualization -->
          <div class="reveal-item relative">
            <div class="absolute -inset-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 opacity-15 blur-xl transition-opacity duration-300 dark:opacity-20" />

            <div class="mesh-visual relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl transition-colors duration-300 dark:border-slate-800 dark:bg-[#0d0d12]">
              <!-- Browser chrome -->
              <div class="flex items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <div class="flex gap-1.5">
                  <div class="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <div class="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div class="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div class="ml-3 flex flex-1 items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 dark:border-slate-700 dark:bg-slate-900">
                  <svg class="h-3 w-3 text-emerald-500" viewBox="0 0 8 8" fill="none"><circle cx="4" cy="4" r="3" stroke="currentColor" stroke-width="1"/><circle cx="4" cy="4" r="1" fill="currentColor"/></svg>
                  <span class="font-mono text-[0.65rem] text-slate-400 dark:text-slate-500">mesh.volnux.dev/topology</span>
                </div>
              </div>

              <!-- Mesh topology visualization -->
              <div class="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-[radial-gradient(rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:24px_24px] p-6 dark:bg-[radial-gradient(rgba(255,255,255,0.02)_1px,transparent_1px)] dark:bg-[size:24px_24px]">
                <!-- SVG connections -->
                <svg class="mesh-svg pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 400 280">
                  <!-- Connection lines -->
                  <line x1="80" y1="80" x2="200" y2="60" class="mesh-line" />
                  <line x1="200" y1="60" x2="320" y2="90" class="mesh-line" />
                  <line x1="80" y1="80" x2="140" y2="180" class="mesh-line" />
                  <line x1="200" y1="60" x2="280" y2="200" class="mesh-line" />
                  <line x1="320" y1="90" x2="280" y2="200" class="mesh-line" />
                  <line x1="140" y1="180" x2="280" y2="200" class="mesh-line" />
                  <line x1="140" y1="180" x2="60" y2="220" class="mesh-line" />
                  <line x1="320" y1="90" x2="370" y2="170" class="mesh-line" />

                  <!-- Data flow particles -->
                  <circle r="3" class="mesh-particle mesh-particle-1">
                    <animateMotion dur="3s" repeatCount="indefinite" path="M80,80 L200,60 L320,90" />
                  </circle>
                  <circle r="3" class="mesh-particle mesh-particle-2">
                    <animateMotion dur="4s" repeatCount="indefinite" path="M140,180 L280,200 L370,170 L320,90" />
                  </circle>
                  <circle r="2.5" class="mesh-particle mesh-particle-3">
                    <animateMotion dur="3.5s" repeatCount="indefinite" path="M60,220 L140,180 L80,80 L200,60" />
                  </circle>

                  <!-- Nodes -->
                  <circle cx="80" cy="80" r="8" class="mesh-node mesh-node-primary" />
                  <circle cx="200" cy="60" r="8" class="mesh-node mesh-node-secondary" />
                  <circle cx="320" cy="90" r="8" class="mesh-node mesh-node-tertiary" />
                  <circle cx="140" cy="180" r="8" class="mesh-node mesh-node-primary" />
                  <circle cx="280" cy="200" r="8" class="mesh-node mesh-node-secondary" />
                  <circle cx="60" cy="220" r="6" class="mesh-node mesh-node-tertiary" />
                  <circle cx="370" cy="170" r="6" class="mesh-node mesh-node-primary" />

                  <!-- Node labels -->
                  <text x="80" y="68" class="mesh-label">accra-dw</text>
                  <text x="200" y="48" class="mesh-label">lagos-api</text>
                  <text x="320" y="78" class="mesh-label">nairobi-etl</text>
                  <text x="140" y="198" class="mesh-label">gpu-cluster</text>
                  <text x="280" y="218" class="mesh-label">celery-pool</text>
                </svg>

                <!-- Overlay status -->
                <div class="absolute bottom-3 left-3 flex items-center gap-2 rounded-md border border-slate-200 bg-white/80 px-2.5 py-1.5 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  <span class="font-mono text-[0.6rem] text-slate-500 dark:text-slate-400">7 peers online</span>
                </div>
                <div class="absolute bottom-3 right-3 rounded-md border border-slate-200 bg-white/80 px-2.5 py-1.5 backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
                  <span class="font-mono text-[0.6rem] text-emerald-600 dark:text-emerald-400">mTLS ✓</span>
                </div>
              </div>

              <!-- Status bar -->
              <div class="flex items-center gap-4 border-t border-slate-200 px-4 py-2 dark:border-slate-800">
                <span class="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  mesh healthy
                </span>
                <span class="text-xs text-slate-300 dark:text-slate-600">|</span>
                <span class="text-xs text-slate-500">latency: 2ms</span>
                <span class="ml-auto text-xs text-teal-600 dark:text-teal-400">Runtime v0.9</span>
              </div>
            </div>

            <!-- Floating badge -->
            <div class="absolute -left-4 top-12 rounded-lg border border-slate-200 bg-white p-3 shadow-xl transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900">
              <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white">MR</div>
                <div class="text-xs">
                  <div class="font-medium text-slate-900 dark:text-white">Mesh</div>
                  <div class="text-emerald-600 dark:text-emerald-400">7 peers</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
    MESH TICKER
    ============================================ -->
    <div class="relative z-10 flex h-10 items-center overflow-hidden border-y border-slate-200 bg-slate-50/50 transition-colors duration-300 dark:border-slate-800 dark:bg-[#0c0c10]">
      <div class="pointer-events-none absolute inset-y-0 left-0 z-20 w-20 bg-gradient-to-r from-slate-50 to-transparent dark:from-[#0c0c10] dark:to-transparent" />
      <div class="pointer-events-none absolute inset-y-0 right-0 z-20 w-20 bg-gradient-to-l from-slate-50 to-transparent dark:from-[#0c0c10] dark:to-transparent" />
      <div class="ticker-track flex gap-0 whitespace-nowrap">
        <template v-for="round in 2" :key="round">
          <span v-for="(snippet, si) in tickerSnippets" :key="`${round}-${si}`" class="ticker-snippet">
            <span v-for="(part, pi) in snippet.parts" :key="pi" :class="tickerTokenClass(part.t)">{{ part.v }}</span>
          </span>
        </template>
      </div>
    </div>

    <!-- ============================================
    ARCHITECTURE
    ============================================ -->
    <section id="architecture" class="relative py-16 transition-colors duration-300 dark:bg-[#0a0a0f]">
      <div class="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white opacity-50 transition-colors duration-300 dark:from-[#0a0a0f] dark:via-[#0c0c10] dark:to-[#0a0a0f] dark:opacity-100" />

      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal-item mb-12 text-center">
          <span class="mb-2 text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">Architecture</span>
          <h2 class="mb-4 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            A mesh that thinks<br />
            <span class="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-cyan-400">for itself.</span>
          </h2>
          <p class="mx-auto max-w-xl text-slate-600 dark:text-slate-400">
            Volnux replaces the central scheduler with a living network. Nodes discover each other, negotiate execution, and reroute on failure — without any coordination server.
          </p>
        </div>

        <div class="relative grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <!-- Connecting line -->
          <div class="pointer-events-none absolute top-10 left-[12.5%] right-[12.5%] hidden h-px bg-gradient-to-r from-emerald-500/30 via-teal-500/30 to-cyan-500/30 lg:block" />

          <div
            v-for="(step, i) in steps"
            :key="step.num"
            class="reveal-item reveal-stagger-item group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all duration-500 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-emerald-500/30 dark:hover:shadow-emerald-500/10 opacity-0"
            :style="{ transitionDelay: `${i * 100}ms` }"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div class="relative">
              <button
                type="button"
                class="mb-4 flex h-12 w-12 items-center justify-center rounded-xl font-display text-lg font-extrabold transition-all duration-300"
                :class="activeStep === i
                  ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25'
                  : 'border-2 border-slate-200 bg-white text-slate-900 hover:border-emerald-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-emerald-500/30'"
                @click="activeStep = i"
              >
                {{ step.num }}
              </button>
              <h3 class="mb-2 font-display text-lg font-bold text-slate-900 dark:text-white">{{ step.title }}</h3>
              <p class="mb-4 text-sm text-slate-600 dark:text-slate-400">{{ step.desc }}</p>
              <div class="overflow-hidden rounded-lg border border-slate-200 bg-slate-900 p-3 dark:border-slate-800 dark:bg-[#0a0a0f]">
                <pre class="font-mono text-xs leading-relaxed" v-html="step.code" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
    CAPABILITIES
    ============================================ -->
    <section id="capabilities" class="relative border-y border-slate-200 bg-slate-50/50 py-16 transition-colors duration-300 dark:border-slate-800/50 dark:bg-[#0c0c10]">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal-item mb-12 grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <span class="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">Capabilities</span>
            <h2 class="font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Built for real<br />
              <span class="bg-gradient-to-r from-emerald-500 to-cyan-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-cyan-400">distributed systems.</span>
            </h2>
          </div>
          <div class="flex items-end">
            <p class="text-slate-600 dark:text-slate-400">
              Every component designed from first principles for production mesh operation. No coordinator, no single point of failure, no compromises on security or observability.
            </p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(cap, i) in capabilities"
            :key="cap.key"
            class="reveal-item reveal-stagger-item group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-emerald-500/20 dark:hover:shadow-emerald-500/5 opacity-0"
            :style="{ transitionDelay: `${i * 50}ms` }"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div class="absolute inset-x-0 top-0 h-0.5 transition-all duration-300" :style="{ background: capabilityAccentMap[cap.key]?.top || '#10b981' }" />
            <div class="relative">
              <div
                class="mb-4 flex h-11 w-11 items-center justify-center rounded-lg"
                :style="{ background: capabilityAccentMap[cap.key]?.iconBg, border: `1px solid ${capabilityAccentMap[cap.key]?.iconBorder}`, color: capabilityAccentMap[cap.key]?.iconColor }"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path :d="cap.icon" /></svg>
              </div>
              <h3 class="mb-2 font-display text-base font-bold text-slate-900 dark:text-white">{{ cap.title }}</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">{{ cap.desc }}</p>
            </div>
          </div>
        </div>

        <!-- Stats row -->
        <div class="reveal-item mt-12 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div class="reveal-stagger-item rounded-xl border border-slate-200 bg-white p-6 text-center transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/30 opacity-0">
            <div class="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">0<span class="text-emerald-500">ms</span></div>
            <div class="mt-1 font-mono text-xs uppercase tracking-wider text-slate-500 dark:text-slate-500">coordinator overhead</div>
          </div>
          <div class="reveal-stagger-item rounded-xl border border-slate-200 bg-white p-6 text-center transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/30 opacity-0">
            <div class="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white"><span class="text-emerald-500">∞</span></div>
            <div class="mt-1 font-mono text-xs uppercase tracking-wider text-slate-500 dark:text-slate-500">horizontal scale</div>
          </div>
          <div class="reveal-stagger-item rounded-xl border border-slate-200 bg-white p-6 text-center transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/30 opacity-0">
            <div class="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">P<span class="text-emerald-500">2</span>P</div>
            <div class="mt-1 font-mono text-xs uppercase tracking-wider text-slate-500 dark:text-slate-500">pure mesh topology</div>
          </div>
          <div class="reveal-stagger-item rounded-xl border border-slate-200 bg-white p-6 text-center transition-colors duration-300 dark:border-slate-800 dark:bg-slate-900/30 opacity-0">
            <div class="font-display text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">0<span class="text-emerald-500">spof</span></div>
            <div class="mt-1 font-mono text-xs uppercase tracking-wider text-slate-500 dark:text-slate-500">single points of failure</div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
    DISPATCH MODEL
    ============================================ -->
    <section id="dispatch" class="relative py-16 transition-colors duration-300 dark:bg-[#0a0a0f]">
      <div class="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white opacity-50 transition-colors duration-300 dark:from-[#0a0a0f] dark:via-[#0c0c10] dark:to-[#0a0a0f] dark:opacity-100" />

      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal-item grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <!-- Left: Copy + targets -->
          <div>
            <span class="mb-2 text-xs font-semibold uppercase tracking-widest text-teal-600 dark:text-teal-400">Dispatch model</span>
            <h2 class="mb-4 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Your infrastructure.<br />
              <span class="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">Your annotations.</span>
            </h2>
            <p class="mb-6 text-slate-600 dark:text-slate-400">
              Declare where each task runs directly in Pointy-lang. The mesh handles the rest — routing, retrying, and streaming results back.
            </p>

            <div class="space-y-3">
              <div
                v-for="(d, i) in dispatchTargets"
                :key="d.tag"
                class="reveal-item reveal-stagger-item group flex items-center gap-4 rounded-lg border border-slate-200 bg-white p-4 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-emerald-500/20 opacity-0"
                :style="{ transitionDelay: `${i * 70}ms` }"
              >
                <div class="flex h-9 w-9 items-center justify-center rounded-lg" :style="{ background: `${d.accent}15`, border: `1px solid ${d.accent}30` }">
                  <div class="h-2.5 w-2.5 rounded-full" :style="{ background: d.accent, boxShadow: `0 0 8px ${d.accent}80` }" />
                </div>
                <div class="min-w-0 flex-1">
                  <h4 class="font-display text-sm font-bold text-slate-900 dark:text-white">{{ d.title }}</h4>
                  <p class="text-xs text-slate-500 dark:text-slate-400">{{ d.desc }}</p>
                </div>
                <span class="shrink-0 rounded border border-slate-200 bg-slate-50 px-2 py-0.5 font-mono text-[0.65rem] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">{{ d.tag }}</span>
              </div>
            </div>
          </div>

          <!-- Right: Code block -->
          <div class="relative">
            <div class="absolute -inset-2 rounded-xl bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 blur-xl" />

            <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0a0a0f]">
              <div class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500" />
              <div class="flex items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
                <div class="flex gap-1.5">
                  <div class="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                  <div class="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                  <div class="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <div class="ml-auto flex items-center gap-2 font-mono text-[0.6rem] text-slate-400 dark:text-slate-500">
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  pipeline.pointy
                </div>
              </div>
              <div class="p-5 font-mono text-sm leading-loose">
                <span class="text-slate-400 dark:text-slate-500"># Ingest on the data warehouse node</span><br>
                <span class="text-cyan-600 dark:text-cyan-400">pypi</span><span class="text-amber-600 dark:text-amber-300">:Extract@v2.1</span><span class="text-amber-600 dark:text-amber-300">[node=<span class="text-pink-600 dark:text-pink-300">"accra-dw"</span>]</span><br>
                <br>
                <span class="text-slate-400 dark:text-slate-500"># Fan-out validation in parallel</span><br>
                &nbsp;&nbsp;<span class="text-teal-600 dark:text-teal-400">|-></span> <span class="text-slate-800 dark:text-white">MAP</span><span class="text-amber-600 dark:text-amber-300">&lt;Validate&gt;</span><span class="text-amber-600 dark:text-amber-300">[executor=<span class="text-pink-600 dark:text-pink-300">"celery"</span>]</span> <span class="text-teal-600 dark:text-teal-400">||</span> <span class="text-slate-800 dark:text-white">Checkpoint</span><br>
                <br>
                <span class="text-slate-400 dark:text-slate-500"># AI enrichment on GPU cluster, retry 3×</span><br>
                &nbsp;&nbsp;<span class="text-emerald-600 dark:text-emerald-400">-></span> <span class="text-slate-800 dark:text-white">EnrichWithAI</span><span class="text-amber-600 dark:text-amber-300">[node=<span class="text-pink-600 dark:text-pink-300">"gpu-cluster"</span>]</span> <span class="text-amber-600 dark:text-amber-300">* 3</span><br>
                <br>
                <span class="text-slate-400 dark:text-slate-500"># Route by outcome, notify team</span><br>
                &nbsp;&nbsp;<span class="text-emerald-600 dark:text-emerald-400">-></span> <span class="text-slate-800 dark:text-white">Process</span><span class="text-slate-500 dark:text-slate-300">(</span><br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-emerald-600 dark:text-emerald-400">success</span> <span class="text-emerald-600 dark:text-emerald-400">-></span> <span class="text-slate-800 dark:text-white">Store</span> <span class="text-emerald-600 dark:text-emerald-400">-></span> <span class="text-slate-800 dark:text-white">NotifyTeam</span><span class="text-slate-500 dark:text-slate-300">,</span><br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-red-600 dark:text-red-400">failure</span> <span class="text-emerald-600 dark:text-emerald-400">-></span> <span class="text-slate-800 dark:text-white">Quarantine</span> <span class="text-emerald-600 dark:text-emerald-400">-></span> <span class="text-slate-800 dark:text-white">AlertOps</span><br>
                &nbsp;&nbsp;<span class="text-slate-500 dark:text-slate-300">)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
    CTA
    ============================================ -->
    <section class="relative py-16 transition-colors duration-300 dark:bg-[#0a0a0f]">
      <div class="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 opacity-50 transition-colors duration-300 dark:from-[#0c0c10] dark:via-[#0a0a0f] dark:to-[#0c0c10] dark:opacity-100" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)]" />

      <div class="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div class="reveal-item">
          <span class="mb-6 block font-display text-5xl leading-none tracking-tight text-emerald-500/15 dark:text-emerald-400/10">→ → →</span>
          <h2 class="mb-4 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            The mesh is<br />
            <span class="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent dark:from-emerald-400 dark:to-teal-400">waiting for your workloads.</span>
          </h2>
          <p class="mb-8 text-slate-600 dark:text-slate-400">
            Join the early access programme and be among the first teams running production workflows on the Volnux mesh.
          </p>
          <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="#" class="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40">
              Get early access
              <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <RouterLink to="/" class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/50 px-6 py-3 text-base font-medium text-slate-700 backdrop-blur-sm transition-all hover:border-emerald-500/50 hover:text-emerald-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:text-emerald-400">
              Volnux home →
            </RouterLink>
          </div>

          <p class="mt-6 font-mono text-xs text-slate-400 dark:text-slate-600">
            The mesh runtime is in active development — early access builds are available for selected teams.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

<script lang="ts">
export default {
  methods: {
    tickerTokenClass(type: string): Record<string, boolean> {
      return {
        'tk-arr': type === 'arr',
        'tk-nd': type === 'nd',
        'tk-op': type === 'op',
        'tk-meta': type === 'meta',
        'tk-ann': type === 'ann',
        'tk-str': type === 'str',
        'tk-rt': type === 'rt',
        'tk-txt': type === 'txt',
      }
    },
  },
}
</script>

<style scoped>
.reveal-item {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.reveal-item.opacity-100 {
  opacity: 1;
}

.reveal-item.translate-y-0 {
  transform: translateY(0);
}

.reveal-stagger-item {
  opacity: 0;
  transform: translateY(16px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.reveal-stagger-item.opacity-100 {
  opacity: 1;
}

.reveal-stagger-item.translate-y-0 {
  transform: translateY(0);
}

.mesh-line {
  stroke: rgba(16, 185, 129, 0.25);
  stroke-width: 1.5;
  stroke-dasharray: 6 4;
  animation: meshPulse 3s ease-in-out infinite;
}

.dark .mesh-line {
  stroke: rgba(16, 185, 129, 0.2);
}

.mesh-node {
  fill: #10b981;
  filter: drop-shadow(0 0 6px rgba(16, 185, 129, 0.5));
  animation: nodeGlow 2.5s ease-in-out infinite alternate;
}

.mesh-node-secondary {
  fill: #14b8a6;
  filter: drop-shadow(0 0 6px rgba(20, 184, 166, 0.5));
}

.mesh-node-tertiary {
  fill: #06b6d4;
  filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.5));
}

.mesh-label {
  font-size: 9px;
  font-family: 'DM Mono', monospace;
  fill: #64748b;
  text-anchor: middle;
}

.dark .mesh-label {
  fill: #94a3b8;
}

.mesh-particle-1 {
  fill: #10b981;
  filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.8));
}

.mesh-particle-2 {
  fill: #14b8a6;
  filter: drop-shadow(0 0 4px rgba(20, 184, 166, 0.8));
}

.mesh-particle-3 {
  fill: #06b6d4;
  filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.8));
}

@keyframes meshPulse {
  0%, 100% { stroke-opacity: 0.3; }
  50% { stroke-opacity: 0.7; }
}

@keyframes nodeGlow {
  0% { filter: drop-shadow(0 0 4px rgba(16, 185, 129, 0.3)); }
  100% { filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6)); }
}

@keyframes tickerScroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.ticker-track {
  animation: tickerScroll 32s linear infinite;
}

.ticker-snippet {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 2rem;
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  border-right: 1px solid rgba(0, 0, 0, 0.08);
}

.dark .ticker-snippet {
  border-right-color: rgba(255, 255, 255, 0.06);
}

.tk-arr { color: #10b981; margin: 0 0.3rem; }
.tk-nd { color: #1e293b; }
.dark .tk-nd { color: #e2e8f0; }
.tk-op { color: #14b8a6; margin: 0 0.3rem; }
.tk-meta { color: #06b6d4; }
.tk-ann { color: #f59e0b; }
.tk-rt { color: #fbbf24; margin-left: 0.3rem; }
.tk-str { color: #f472b6; }
.tk-txt { color: inherit; }

::selection {
  background: rgba(16, 185, 129, 0.3);
  color: white;
}
</style>
