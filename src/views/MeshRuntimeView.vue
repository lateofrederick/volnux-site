<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import MeshCanvas from '@/components/MeshCanvas.vue'
import MeshTopologyPanels from '@/views/mesh/MeshTopologyPanels.vue'

const mainEl = ref<HTMLElement | null>(null)
const stepIndex = ref(0)
let revealObserver: IntersectionObserver | null = null

const steps = [
  {
    title: 'Node Discovery',
    body: 'New nodes broadcast their presence over the mesh. Existing peers respond with topology metadata. No registry. No seed server. The mesh self-assembles.',
  },
  {
    title: 'mTLS Handshake',
    body: 'Every link is mutually authenticated before a single byte of payload crosses. Certificate rotation happens live without dropping connections.',
  },
  {
    title: 'Task Dispatch',
    body: 'The runtime reads node and executor annotations from your Pointy-lang workflow and routes each task to the correct peer or Celery worker automatically.',
  },
  {
    title: 'Failure Recovery',
    body: 'The watchdog detects dead links in real time. Failed tasks rehydrate from their last checkpoint on any available node. No human intervention required.',
  },
] as const

const capabilities = [
  { icon: '⬡', iconClass: 'text-vn-accent', title: 'Peer-to-peer topology', body: 'No master node. No coordinator process. Every Volnux node is a full peer. The mesh routes, balances, and heals without centralised coordination.' },
  { icon: '⇄', iconClass: 'text-vn-accent2', title: 'Adaptive mini-context', body: 'Execution state switches between small, batch, and aggregate modes automatically. Large workloads stream their results without memory pressure on any node.' },
  { icon: '◎', iconClass: 'text-vn-accent3', title: 'Checkpoint rehydration', body: 'Every task is checkpointed at execution boundaries. A failed node\'s work rehydrates on any healthy peer. Workflows never restart from zero.' },
  { icon: '⚡', iconClass: 'text-vn-attr', title: 'Multi-executor dispatch', body: 'Route tasks to mesh nodes, Celery workers, or local processes — all from Pointy-lang annotations. No custom routing code required.' },
  { icon: '⬤', iconClass: 'text-vn-accent', title: 'mTLS by default', body: 'Every inter-node connection is mutually authenticated. Certificate rotation happens live. Zero-trust networking with no extra configuration.' },
  { icon: '◈', iconClass: 'text-vn-accent2', title: 'OTEL telemetry', body: 'Every packet, every state transition, every retry is traced with OpenTelemetry. Full distributed trace across the entire mesh without instrumentation overhead.' },
] as const

const dispatchTargets = [
  { dot: 'bg-vn-accent shadow-[0_0_8px_rgba(0,229,255,0.5)]', title: 'Mesh Node', desc: 'Dispatch to any peer in the cluster by node ID', tag: 'node="accra-dw"' },
  { dot: 'bg-vn-accent2 shadow-[0_0_8px_rgba(123,97,255,0.5)]', title: 'Celery Worker', desc: 'Route to Celery workers via Redis or RabbitMQ', tag: 'executor="celery"' },
  { dot: 'bg-vn-accent3 shadow-[0_0_8px_rgba(0,255,148,0.5)]', title: 'Local Process', desc: 'Execute on the current node with default executor', tag: 'local' },
  { dot: 'bg-vn-attr shadow-[0_0_8px_rgba(255,159,67,0.5)]', title: 'GPU Cluster', desc: 'Pin compute-heavy AI tasks to GPU-equipped peers', tag: 'node="gpu-cluster"' },
] as const

const dispatchCode = `<span class="italic text-mesh-muted"># Ingest on the data warehouse node</span><br/><span class="text-vn-accent3">pypi</span><span class="text-vn-attr">:Extract@v2.1</span><span class="text-vn-attr">[node=<span class="text-vn-string">"accra-dw"</span>]</span><br/><br/><span class="italic text-mesh-muted"># Fan-out validation in parallel</span><br/>&nbsp;&nbsp;<span class="font-medium text-vn-accent">|-></span> <span class="text-mesh-text">MAP</span><span class="text-vn-attr">&lt;Validate&gt;</span><span class="text-vn-attr">[executor=<span class="text-vn-string">"celery"</span>]</span> <span class="font-medium text-vn-accent">||</span> <span class="text-mesh-text">Checkpoint</span><br/><br/><span class="italic text-mesh-muted"># AI enrichment on GPU cluster, retry 3×</span><br/>&nbsp;&nbsp;<span class="font-medium text-vn-accent">-></span> <span class="text-mesh-text">EnrichWithAI</span><span class="text-vn-attr">[node=<span class="text-vn-string">"gpu-cluster"</span>]</span> <span class="text-vn-retry">* 3</span><br/><br/><span class="italic text-mesh-muted"># Route by outcome, notify team</span><br/>&nbsp;&nbsp;<span class="font-medium text-vn-accent">-></span> <span class="text-mesh-text">Process</span>(<br/>&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-vn-accent3">success</span> <span class="font-medium text-vn-accent">-></span> <span class="text-mesh-text">Store</span> <span class="font-medium text-vn-accent">-></span> <span class="text-mesh-text">NotifyTeam</span>,<br/>&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-vn-accent3">failure</span> <span class="font-medium text-vn-accent">-></span> <span class="text-mesh-text">Quarantine</span> <span class="font-medium text-vn-accent">-></span> <span class="text-mesh-text">AlertOps</span><br/>&nbsp;&nbsp;)`

function setStep(i: number) {
  stepIndex.value = i
}

onMounted(() => {
  const el = mainEl.value
  if (!el) return
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return
        const t = e.target as HTMLElement
        t.classList.add('opacity-100', 'translate-y-0')
        t.classList.remove('opacity-0', 'translate-y-6')
        t.querySelectorAll<HTMLElement>('.mesh-stagger-item').forEach((child, i) => {
          child.style.transitionDelay = `${i * 0.07}s`
          child.classList.remove('opacity-0', 'translate-y-4')
          child.classList.add('opacity-100', 'translate-y-0')
        })
      })
    },
    { threshold: 0.1 },
  )

  el.querySelectorAll('.mesh-reveal').forEach((node) => revealObserver?.observe(node))
})

onUnmounted(() => revealObserver?.disconnect())
</script>

<template>
  <MeshCanvas />
  <main ref="mainEl" class="relative z-[2]">
    <section
      id="hero"
      class="relative z-[2] flex min-h-[100dvh] flex-col items-center justify-center px-6 pb-24 pt-32 text-center sm:px-8 lg:min-h-screen lg:pb-28 lg:pt-36"
    >
      <p
        class="mb-8 flex animate-fade-up items-center justify-center gap-4 font-mono text-[0.72rem] uppercase tracking-[0.2em] text-vn-accent opacity-0 [animation-delay:0.2s] [animation-fill-mode:forwards]"
      >
        <span class="h-px w-10 bg-gradient-to-r from-transparent to-vn-accent" />
        Volnux — Mesh Runtime
        <span class="h-px w-10 bg-gradient-to-l from-transparent to-vn-accent" />
      </p>
      <h1
        class="animate-fade-up font-display text-[clamp(3.5rem,8vw,7rem)] font-extrabold leading-[0.95] tracking-[-0.05em] text-mesh-text opacity-0 [animation-delay:0.35s] [animation-fill-mode:forwards]"
      >
        No master.<br />
        <span class="block text-transparent [-webkit-text-stroke:1px_rgba(0,229,255,0.4)]">No bottleneck.</span>
        <span class="block bg-gradient-to-br from-vn-accent to-vn-accent2 bg-clip-text text-transparent">No limits.</span>
      </h1>
      <p
        class="mx-auto mt-6 max-w-xl animate-fade-up text-lg leading-relaxed text-mesh-muted opacity-0 [animation-delay:0.5s] [animation-fill-mode:forwards]"
      >
        The Volnux Mesh Runtime is a fully decentralised P2P execution layer. Every node is equal. Tasks route themselves.
        The cluster heals itself.
      </p>
      <div
        class="mt-10 flex animate-fade-up flex-wrap justify-center gap-4 opacity-0 [animation-delay:0.65s] [animation-fill-mode:forwards]"
      >
        <a href="#" class="vn-btn-primary rounded-[3px] text-[0.875rem]">Get Early Access</a>
        <a href="#" class="mesh-btn-outline">Read the Docs →</a>
      </div>
      <div
        class="absolute bottom-10 left-1/2 flex -translate-x-1/2 animate-fade-up flex-col items-center gap-2 opacity-0 [animation-delay:1.2s] [animation-fill-mode:forwards]"
      >
        <span class="font-mono text-[0.65rem] uppercase tracking-[0.15em] text-mesh-muted2">Scroll</span>
        <div class="h-10 w-px origin-top bg-gradient-to-b from-vn-accent to-transparent animate-scroll-line" />
      </div>
    </section>

    <section id="how" class="mesh-section border-y border-mesh-border bg-mesh-black/60 backdrop-blur-sm">
      <div class="mesh-container">
        <p
          class="mesh-reveal flex translate-y-6 items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-vn-accent opacity-0 transition duration-700 ease-out"
        >
          <span class="h-px w-6 bg-vn-accent" />
          Architecture
        </p>
        <h2
          class="mesh-reveal mt-4 translate-y-6 font-display text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-tight tracking-[-0.04em] text-mesh-text opacity-0 transition duration-700 ease-out"
        >
          A mesh that thinks<br />for itself.
        </h2>
        <p
          class="mesh-reveal mt-5 max-w-xl translate-y-6 text-base leading-relaxed text-mesh-muted opacity-0 transition duration-700 ease-out"
        >
          Volnux replaces the central scheduler with a living network. Nodes discover each other, negotiate execution, and
          reroute on failure — without any coordination server.
        </p>

        <div class="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-24">
          <div class="mesh-reveal translate-y-6 space-y-0 opacity-0 transition duration-700 ease-out">
            <button
              v-for="(s, i) in steps"
              :key="s.title"
              type="button"
              class="flex w-full cursor-pointer gap-6 border-b border-mesh-border py-7 text-left first:pt-0 last:border-b-0 last:pb-0"
              @click="setStep(i)"
            >
              <div
                class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded border font-mono text-[0.75rem] font-medium transition"
                :class="
                  stepIndex === i
                    ? 'border-vn-accent bg-vn-accent text-mesh-black'
                    : 'border-mesh-border2 text-mesh-muted2 hover:border-vn-accent hover:text-vn-accent'
                "
              >
                {{ String(i + 1).padStart(2, '0') }}
              </div>
              <div>
                <p class="mb-1.5 font-display text-base font-bold transition" :class="stepIndex === i ? 'text-mesh-text' : 'text-mesh-muted'">
                  {{ s.title }}
                </p>
                <p class="text-[0.875rem] leading-relaxed text-mesh-muted">{{ s.body }}</p>
              </div>
            </button>
          </div>
          <div class="mesh-reveal translate-y-6 opacity-0 transition duration-700 ease-out">
            <MeshTopologyPanels :step="stepIndex" />
          </div>
        </div>
      </div>
    </section>

    <section id="capabilities" class="mesh-section">
      <div class="mesh-container">
        <p
          class="mesh-reveal flex translate-y-6 items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-vn-accent opacity-0 transition duration-700 ease-out"
        >
          <span class="h-px w-6 bg-vn-accent" />
          Capabilities
        </p>
        <h2
          class="mesh-reveal mt-4 translate-y-6 font-display text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-tight tracking-[-0.04em] text-mesh-text opacity-0 transition duration-700 ease-out"
        >
          Built for real<br />distributed systems.
        </h2>
        <p
          class="mesh-reveal mt-5 max-w-xl translate-y-6 text-base leading-relaxed text-mesh-muted opacity-0 transition duration-700 ease-out"
        >
          Every component designed from first principles for production mesh operation.
        </p>

        <div
          class="mesh-reveal mt-16 grid translate-y-6 grid-cols-1 gap-px overflow-hidden rounded-[10px] border border-mesh-border bg-mesh-border opacity-0 transition duration-700 ease-out sm:grid-cols-2 lg:grid-cols-3"
        >
          <article
            v-for="c in capabilities"
            :key="c.title"
            class="mesh-stagger-item translate-y-4 bg-mesh-surface p-9 opacity-0 transition duration-500 ease-out hover:bg-mesh-surface2"
          >
            <span class="mb-5 block font-mono text-2xl leading-none" :class="c.iconClass">{{ c.icon }}</span>
            <h3 class="mb-2 font-display text-[0.95rem] font-bold tracking-tight text-mesh-text">{{ c.title }}</h3>
            <p class="text-[0.85rem] leading-relaxed text-mesh-muted">{{ c.body }}</p>
          </article>
        </div>

        <div
          class="mesh-reveal mt-20 grid translate-y-6 grid-cols-1 gap-px overflow-hidden rounded-[10px] border border-mesh-border bg-mesh-border opacity-0 transition duration-700 ease-out sm:grid-cols-2 lg:grid-cols-4"
        >
          <div class="mesh-stagger-item translate-y-4 bg-mesh-surface px-8 py-10 text-center opacity-0 transition duration-500 ease-out">
            <div class="font-display text-5xl font-extrabold leading-none tracking-[-0.05em] text-mesh-text">0<span class="text-vn-accent">ms</span></div>
            <div class="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-mesh-muted">coordinator overhead</div>
          </div>
          <div class="mesh-stagger-item translate-y-4 bg-mesh-surface px-8 py-10 text-center opacity-0 transition duration-500 ease-out">
            <div class="font-display text-5xl font-extrabold leading-none tracking-[-0.05em] text-mesh-text"><span class="text-vn-accent">∞</span></div>
            <div class="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-mesh-muted">horizontal scale</div>
          </div>
          <div class="mesh-stagger-item translate-y-4 bg-mesh-surface px-8 py-10 text-center opacity-0 transition duration-500 ease-out">
            <div class="font-display text-5xl font-extrabold leading-none tracking-[-0.05em] text-mesh-text">P<span class="text-vn-accent">2</span>P</div>
            <div class="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-mesh-muted">pure mesh topology</div>
          </div>
          <div class="mesh-stagger-item translate-y-4 bg-mesh-surface px-8 py-10 text-center opacity-0 transition duration-500 ease-out">
            <div class="font-display text-5xl font-extrabold leading-none tracking-[-0.05em] text-mesh-text">0<span class="text-vn-accent">spof</span></div>
            <div class="mt-2 font-mono text-[0.7rem] uppercase tracking-[0.1em] text-mesh-muted">single points of failure</div>
          </div>
        </div>
      </div>
    </section>

    <section id="dispatch" class="mesh-section border-y border-mesh-border bg-mesh-black/50 backdrop-blur-sm">
      <div class="mesh-container">
        <p
          class="mesh-reveal flex translate-y-6 items-center gap-3 font-mono text-[0.7rem] uppercase tracking-[0.18em] text-vn-accent opacity-0 transition duration-700 ease-out"
        >
          <span class="h-px w-6 bg-vn-accent" />
          Dispatch model
        </p>
        <h2
          class="mesh-reveal mt-4 translate-y-6 font-display text-[clamp(2rem,4vw,3.25rem)] font-extrabold leading-tight tracking-[-0.04em] text-mesh-text opacity-0 transition duration-700 ease-out"
        >
          Your infrastructure.<br />Your annotations.
        </h2>
        <p
          class="mesh-reveal mt-5 max-w-xl translate-y-6 text-base leading-relaxed text-mesh-muted opacity-0 transition duration-700 ease-out"
        >
          Declare where each task runs directly in Pointy-lang. The mesh handles the rest — routing, retrying, and streaming
          results back.
        </p>

        <div class="mt-16 grid grid-cols-1 gap-12 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
          <div class="mesh-reveal flex translate-y-6 flex-col gap-4 opacity-0 transition duration-700 ease-out">
            <div
              v-for="d in dispatchTargets"
              :key="d.tag"
              class="mesh-stagger-item flex translate-y-4 items-center gap-5 rounded-md border border-mesh-border bg-mesh-surface px-5 py-5 opacity-0 transition duration-500 ease-out hover:border-mesh-border2 hover:bg-mesh-surface2"
            >
              <div class="size-2.5 shrink-0 rounded-full" :class="d.dot" />
              <div class="min-w-0 flex-1">
                <h4 class="font-display text-sm font-bold text-mesh-text">{{ d.title }}</h4>
                <p class="text-xs text-mesh-muted">{{ d.desc }}</p>
              </div>
              <span class="shrink-0 rounded border border-mesh-border2 px-2 py-0.5 font-mono text-[0.65rem] text-mesh-muted2">{{ d.tag }}</span>
            </div>
          </div>
          <div class="mesh-reveal mesh-code-panel translate-y-6 opacity-0 transition duration-700 ease-out">
            <div class="flex items-center gap-2 border-b border-mesh-border px-5 py-3">
              <span class="size-2 rounded-full bg-[#ff5f57]" />
              <span class="size-2 rounded-full bg-[#ffbd2e]" />
              <span class="size-2 rounded-full bg-[#28c840]" />
              <span class="ml-auto font-mono text-[0.65rem] tracking-wide text-mesh-muted2">pipeline.pointy</span>
            </div>
            <div class="p-6 leading-8" v-html="dispatchCode" />
          </div>
        </div>
      </div>
    </section>

    <section id="cta" class="relative z-[2] px-6 py-28 text-center sm:px-8 lg:py-40">
      <div class="mesh-container max-w-[680px]">
        <span
          class="mesh-reveal mb-6 block translate-y-6 font-mono text-6xl leading-none tracking-tight text-vn-accent/15 opacity-0 transition duration-700 ease-out"
        >→ → →</span>
        <h2
          class="mesh-reveal translate-y-6 font-display text-[clamp(2.5rem,5vw,4rem)] font-extrabold leading-tight tracking-[-0.04em] text-mesh-text opacity-0 transition duration-700 ease-out"
        >
          The mesh is <em class="not-italic text-transparent [-webkit-text-stroke:1px_rgba(0,229,255,0.5)]">waiting</em><br />
          for your workloads.
        </h2>
        <p
          class="mesh-reveal mx-auto mt-6 max-w-xl translate-y-6 text-base leading-relaxed text-mesh-muted opacity-0 transition duration-700 ease-out"
        >
          Join the early access programme and be among the first teams running production workflows on the Volnux mesh.
        </p>
        <div class="mesh-reveal mt-10 flex translate-y-6 flex-wrap justify-center gap-4 opacity-0 transition duration-700 ease-out">
          <a href="#" class="vn-btn-primary rounded-[3px] text-[0.875rem]">Get Early Access</a>
          <RouterLink to="/" class="mesh-btn-outline">← Back to Home</RouterLink>
        </div>
      </div>
    </section>
  </main>
</template>
