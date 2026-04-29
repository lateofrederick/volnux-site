<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const mainEl = ref<HTMLElement | null>(null)
const stepIndex = ref(0)
let revealObserver: IntersectionObserver | null = null

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
</script>

<template>
  <main ref="mainEl" class="relative">
    <!-- Hero Section -->
    <section id="hero" class="relative flex min-h-[calc(100vh-64px)] items-center overflow-hidden py-12">
      <!-- Background glow blobs -->
      <div class="pointer-events-none absolute -left-24 -top-24 h-[700px] w-[700px] rounded-full" style="background: radial-gradient(circle, rgba(123,97,255,0.07) 0%, transparent 65%);"></div>
      <div class="pointer-events-none absolute bottom-0 right-[10%] h-[500px] w-[500px] rounded-full" style="background: radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 65%);"></div>

      <div class="vn-container">
        <div class="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <!-- LEFT: App screenshot -->
          <div class="reveal-item opacity-0" style="animation: slideLeft 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s both;">
            <div class="relative">
              <div class="absolute -inset-5 rounded-2xl" style="background: radial-gradient(circle, rgba(123,97,255,0.15) 0%, transparent 70%);"></div>
              <div class="browser-chrome group relative overflow-hidden rounded-xl border border-vn-border2 bg-vn-surface shadow-2xl" style="transform: perspective(1200px) rotateY(2deg) rotateX(1.5deg); transition: transform 0.4s ease;">
                <div class="flex h-9 items-center gap-1.5 border-b border-vn-border bg-vn-surface2 px-4">
                  <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]"></span>
                  <span class="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]"></span>
                  <span class="h-2.5 w-2.5 rounded-full bg-[#28c840]"></span>
                  <div class="mx-3 flex flex-1 items-center gap-1 rounded border border-vn-border bg-vn-surface3 px-3 py-0.5">
                    <svg class="h-2 w-2 text-vn-accent3" viewBox="0 0 8 8" fill="none"><rect x="1" y="3.5" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1"/><path d="M2.5 3.5V2.5a1.5 1.5 0 0 1 3 0V3.5" stroke="currentColor" stroke-width="1"/></svg>
                    <span class="font-mono text-[0.6rem] text-vn-muted">app.volnux.dev/wizard</span>
                  </div>
                </div>
                <div class="flex min-h-[220px] items-center justify-center bg-gradient-to-br from-[#141a28] to-[#0b0e14] font-mono text-[0.78rem] uppercase tracking-wider text-vn-accent/35">
                  Wizard preview (screenshot)
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT: Text -->
          <div class="reveal-item opacity-0" style="animation: fadeUp 0.7s ease 0.3s both;">
            <div class="mb-7 inline-flex items-center gap-2 rounded-sm border border-vn-accent2/25 bg-vn-accent2/7 px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-wider text-vn-accent2">
              <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-vn-accent2"></span>
              Volnux — Visual tooling
            </div>

            <h1 class="mb-6 font-display text-[clamp(2.5rem,4.5vw,3.75rem)] font-extrabold leading-[1.08] tracking-tight text-vn-white">
              Build workflows<br />
              <em class="not-italic text-vn-accent">visually.</em><br />
              <span class="text-vn-muted">Ship Pointy-lang.</span>
            </h1>

            <p class="mb-9 max-w-md text-base font-light leading-relaxed text-vn-muted">
              Pointy-lang Wizard is a visual canvas for building Volnux workflows without writing code. Drag EventHub components onto the canvas, connect them with edges, configure node annotations — and watch production-ready Pointy-lang generate in real time.
            </p>

            <div class="mb-10 flex flex-wrap gap-3">
              <a href="/wizard" class="vn-btn-primary inline-flex items-center gap-2">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 1.5l6.5 3.5L2 8.5V1.5z" fill="currentColor"/></svg>
                Try the wizard
              </a>
              <a href="#features" class="vn-btn-outline inline-flex items-center">See all features →</a>
            </div>

            <div class="flex gap-7 border-t border-vn-border pt-7">
              <div>
                <div class="mb-1 font-display text-2xl font-bold leading-none tracking-tight text-vn-white">30<span class="text-vn-accent">+</span></div>
                <div class="font-mono text-[0.6rem] uppercase tracking-wider text-vn-muted">EventHub components</div>
              </div>
              <div>
                <div class="mb-1 font-display text-2xl font-bold leading-none tracking-tight text-vn-white">0</div>
                <div class="font-mono text-[0.6rem] uppercase tracking-wider text-vn-muted">Lines of code to write</div>
              </div>
              <div>
                <div class="mb-1 font-display text-2xl font-bold leading-none tracking-tight text-vn-white">Live</div>
                <div class="font-mono text-[0.6rem] uppercase tracking-wider text-vn-muted">Pointy-lang output</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pointy Ticker -->
    <div class="relative z-10 flex h-10 items-center overflow-hidden border-y border-vn-border bg-vn-surface">
      <div class="pointer-events-none absolute inset-y-0 left-0 z-20 w-20 bg-gradient-to-r from-vn-surface to-transparent"></div>
      <div class="pointer-events-none absolute inset-y-0 right-0 z-20 w-20 bg-gradient-to-l from-vn-surface to-transparent"></div>
      <div class="ticker-track flex gap-0 whitespace-nowrap">
        <span class="ticker-snippet"><span class="ts-nd">Extract</span><span class="ts-arr"> -> </span><span class="ts-nd">Transform</span><span class="ts-arr"> -> </span><span class="ts-nd">Load</span></span>
        <span class="ticker-snippet"><span class="ts-nd">LoadUsers</span><span class="ts-op"> |-> </span><span class="ts-meta">MAP</span><span class="ts-ann">&lt;ValidateProfile&gt;</span></span>
        <span class="ticker-snippet"><span class="ts-nd">Ingest</span><span class="ts-arr"> -> </span><span class="ts-nd">Process</span>(<span class="ts-meta">success</span><span class="ts-arr"> -> </span><span class="ts-nd">Save</span>, <span class="ts-meta">failure</span><span class="ts-arr"> -> </span><span class="ts-nd">Reject</span>)</span>
        <span class="ticker-snippet"><span class="ts-nd">EnrichWithAI</span><span class="ts-ann">[node=<span class="ts-str">"gpu-cluster"</span>]</span><span class="ts-rt"> * 3</span></span>
        <span class="ticker-snippet"><span class="ts-nd">KafkaIngest</span><span class="ts-op"> |-> </span><span class="ts-meta">MAP</span><span class="ts-ann">&lt;ValidateEvent&gt;</span><span class="ts-op"> || </span><span class="ts-nd">Checkpoint</span></span>
        <span class="ticker-snippet"><span class="ts-nd">ClassifyIntent</span><span class="ts-arr"> -> </span><span class="ts-nd">RouteAgent</span><span class="ts-ann">[executor=<span class="ts-str">"celery"</span>]</span></span>
        <span class="ticker-snippet"><span class="ts-nd">Extract</span><span class="ts-arr"> -> </span><span class="ts-nd">Transform</span><span class="ts-arr"> -> </span><span class="ts-nd">Load</span></span>
        <span class="ticker-snippet"><span class="ts-nd">LoadUsers</span><span class="ts-op"> |-> </span><span class="ts-meta">MAP</span><span class="ts-ann">&lt;ValidateProfile&gt;</span></span>
        <span class="ticker-snippet"><span class="ts-nd">Ingest</span><span class="ts-arr"> -> </span><span class="ts-nd">Process</span>(<span class="ts-meta">success</span><span class="ts-arr"> -> </span><span class="ts-nd">Save</span>, <span class="ts-meta">failure</span><span class="ts-arr"> -> </span><span class="ts-nd">Reject</span>)</span>
        <span class="ticker-snippet"><span class="ts-nd">EnrichWithAI</span><span class="ts-ann">[node=<span class="ts-str">"gpu-cluster"</span>]</span><span class="ts-rt"> * 3</span></span>
        <span class="ticker-snippet"><span class="ts-nd">KafkaIngest</span><span class="ts-op"> |-> </span><span class="ts-meta">MAP</span><span class="ts-ann">&lt;ValidateEvent&gt;</span><span class="ts-op"> || </span><span class="ts-nd">Checkpoint</span></span>
        <span class="ticker-snippet"><span class="ts-nd">ClassifyIntent</span><span class="ts-arr"> -> </span><span class="ts-nd">RouteAgent</span><span class="ts-ann">[executor=<span class="ts-str">"celery"</span>]</span></span>
      </div>
    </div>

    <!-- Intro Section -->
    <section id="intro" class="vn-section relative z-10">
      <div class="vn-container">
        <div class="grid items-start gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <!-- Left: Sticky -->
          <div class="reveal-item opacity-0 lg:sticky lg:top-20">
            <p class="vn-section-tag">What it is</p>
            <h2 class="mb-4 font-display text-[clamp(1.8rem,3vw,2.75rem)] font-extrabold leading-tight tracking-tight text-vn-white">
              A canvas for<br /><span class="text-vn-accent">Pointy-lang.</span>
            </h2>
            <p class="text-sm font-light leading-relaxed text-vn-muted">
              The Wizard bridges the gap between visual authoring and production workflow code. You design — it writes the language.
            </p>
          </div>

          <!-- Right: Info blocks -->
          <div class="space-y-12">
            <div class="reveal-item reveal-stagger-item border-b border-vn-border pb-12 opacity-0">
              <h3 class="mb-3 flex items-center gap-3 font-display text-lg font-bold tracking-tight text-vn-white">
                <span class="h-2 w-2 rounded-sm bg-vn-accent"></span>
                Visual-first, code-last
              </h3>
              <p class="max-w-xl text-sm font-light leading-relaxed text-vn-muted">
                Most workflow tools make you write YAML or Python and then try to visualise it. Pointy-lang Wizard inverts this: you design the workflow visually on a canvas, and the Pointy-lang definition is generated automatically — live, as you build. The code is the output, not the input.
              </p>
            </div>

            <div class="reveal-item reveal-stagger-item border-b border-vn-border pb-12 opacity-0">
              <h3 class="mb-3 flex items-center gap-3 font-display text-lg font-bold tracking-tight text-vn-white">
                <span class="h-2 w-2 rounded-sm bg-vn-accent2"></span>
                Powered by the EventHub registry
              </h3>
              <p class="max-w-xl text-sm font-light leading-relaxed text-vn-muted">
                The left palette is a live window into the EventHub component registry. Every EventBase class published to PyPI, Git, or the community hub appears as a draggable widget with its source, version, and category visible at a glance. Drag, connect, ship.
              </p>
            </div>

            <div class="reveal-item reveal-stagger-item opacity-0">
              <h3 class="mb-3 flex items-center gap-3 font-display text-lg font-bold tracking-tight text-vn-white">
                <span class="h-2 w-2 rounded-sm bg-vn-accent3"></span>
                Made for teams, not just engineers
              </h3>
              <p class="max-w-xl text-sm font-light leading-relaxed text-vn-muted">
                Because the output is readable Pointy-lang, the Wizard is not just for engineers. A product manager can sketch a workflow, an engineer can fill in the node annotations, and a compliance officer can review the generated definition — all using the same tool without any shared codebase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="vn-section relative z-10 border-y border-vn-border bg-vn-surface">
      <div class="vn-container">
        <div class="reveal-item mb-16 grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <p class="vn-section-tag">Features</p>
            <h2 class="font-display text-[clamp(1.8rem,3vw,2.75rem)] font-extrabold leading-tight tracking-tight text-vn-white">
              Everything you need<br />to <span class="text-vn-accent">build workflows</span><br />visually.
            </h2>
          </div>
          <div class="flex items-end">
            <p class="text-sm font-light leading-relaxed text-vn-muted">
              The Wizard is a complete visual authoring environment — not a diagram tool. Every element on the canvas maps directly to executable Pointy-lang syntax, versioned EventHub components, and Volnux runtime annotations.
            </p>
          </div>
        </div>

        <div class="grid gap-px rounded-lg border border-vn-border bg-vn-border sm:grid-cols-2 lg:grid-cols-3">
          <!-- Feature Card 1 -->
          <div class="reveal-item reveal-stagger-item group relative overflow-hidden bg-vn-surface p-9 opacity-0 transition-colors hover:bg-vn-surface2">
            <div class="absolute inset-x-0 top-0 h-0.5 bg-vn-accent"></div>
            <div class="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-vn-accent/20 bg-vn-accent/10 text-vn-accent">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="4" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.5"/><rect x="11" y="9" width="7" height="7" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M9 7.5h3.5V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </div>
            <h3 class="mb-2 font-display text-base font-bold tracking-tight text-vn-white">Drag-and-drop canvas</h3>
            <p class="text-sm leading-relaxed text-vn-muted">Drop any EventHub component from the left palette directly onto the infinite canvas. Move nodes freely, snap to grid, and rearrange without losing any connections.</p>
          </div>

          <!-- Feature Card 2 -->
          <div class="reveal-item reveal-stagger-item group relative overflow-hidden bg-vn-surface p-9 opacity-0 transition-colors hover:bg-vn-surface2">
            <div class="absolute inset-x-0 top-0 h-0.5 bg-vn-accent2"></div>
            <div class="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-vn-accent2/20 bg-vn-accent2/10 text-vn-accent2">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="5" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/><circle cx="15" cy="10" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M8 10h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </div>
            <h3 class="mb-2 font-display text-base font-bold tracking-tight text-vn-white">Visual edge connections</h3>
            <p class="text-sm leading-relaxed text-vn-muted">Connect nodes by dragging from the output port of one event to the input port of another. Edges render as animated bezier curves with live arrow syntax labels. Delete any edge with a double-click.</p>
          </div>

          <!-- Feature Card 3 -->
          <div class="reveal-item reveal-stagger-item group relative overflow-hidden bg-vn-surface p-9 opacity-0 transition-colors hover:bg-vn-surface2">
            <div class="absolute inset-x-0 top-0 h-0.5 bg-vn-accent3"></div>
            <div class="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-vn-accent3/20 bg-vn-accent3/10 text-vn-accent3">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 17V4l13 6.5L4 17z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
            </div>
            <h3 class="mb-2 font-display text-base font-bold tracking-tight text-vn-white">Live Pointy-lang output</h3>
            <p class="text-sm leading-relaxed text-vn-muted">The bottom panel updates in real time as you build. Every node, edge, annotation, and retry setting is reflected instantly in syntax-highlighted Pointy-lang. Copy to clipboard in one click.</p>
          </div>

          <!-- Feature Card 4 -->
          <div class="reveal-item reveal-stagger-item group relative overflow-hidden bg-vn-surface p-9 opacity-0 transition-colors hover:bg-vn-surface2">
            <div class="absolute inset-x-0 top-0 h-0.5 bg-vn-attr"></div>
            <div class="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-vn-attr/20 bg-vn-attr/10 text-vn-attr">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="3" width="16" height="14" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M7 8h6M7 11h4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
            </div>
            <h3 class="mb-2 font-display text-base font-bold tracking-tight text-vn-white">Node properties panel</h3>
            <p class="text-sm leading-relaxed text-vn-muted">Select any node to edit its name, source (pypi / hub / git / local), version, node annotation, executor, and retry count in the right-hand properties panel — all changes reflected immediately in the output.</p>
          </div>

          <!-- Feature Card 5 -->
          <div class="reveal-item reveal-stagger-item group relative overflow-hidden bg-vn-surface p-9 opacity-0 transition-colors hover:bg-vn-surface2">
            <div class="absolute inset-x-0 top-0 h-0.5 bg-[#ff6eb4]"></div>
            <div class="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-[#ff6eb4]/20 bg-[#ff6eb4]/10 text-[#ff6eb4]">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M10 2L3 6v8l7 4 7-4V6L10 2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>
            </div>
            <h3 class="mb-2 font-display text-base font-bold tracking-tight text-vn-white">EventHub palette</h3>
            <p class="text-sm leading-relaxed text-vn-muted">Browse EventBase components organised by category — Extract, Transform, AI & Agents, Validate, Load, Notify. Every widget shows its source registry and version. Search to filter instantly.</p>
          </div>

          <!-- Feature Card 6 -->
          <div class="reveal-item reveal-stagger-item group relative overflow-hidden bg-vn-surface2 p-9 opacity-0 transition-colors hover:bg-vn-surface">
            <div class="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border border-vn-accent/20 bg-vn-accent/10 text-vn-accent">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M4 4h12v12H4V4z" stroke="rgba(0,229,255,0.6)" stroke-width="1.5"/><path d="M8 8l4 4M12 8l-4 4" stroke="rgba(0,229,255,0.6)" stroke-width="1.5" stroke-linecap="round"/></svg>
            </div>
            <h3 class="mb-2 font-display text-base font-bold tracking-tight text-vn-white">Workflow templates</h3>
            <p class="text-sm leading-relaxed text-vn-muted">Start from a blank canvas or choose a pre-built template — ETL Pipeline, AI Agent, or Streaming. Templates seed the canvas with connected nodes and appropriate annotations so you can start editing immediately.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how" class="vn-section relative z-10">
      <div class="vn-container">
        <div class="reveal-item mb-16 text-center">
          <p class="vn-section-tag mx-auto justify-center">How it works</p>
          <h2 class="mb-4 font-display text-[clamp(1.8rem,3vw,2.75rem)] font-extrabold leading-tight tracking-tight text-vn-white">
            Four steps from<br /><span class="text-vn-accent">canvas to production.</span>
          </h2>
          <p class="mx-auto max-w-md text-sm font-light text-vn-muted">From opening the Wizard to deploying a governed Volnux workflow — no Python, no YAML, no boilerplate.</p>
        </div>

        <div class="relative grid sm:grid-cols-2 lg:grid-cols-4">
          <!-- Connecting line (hidden on mobile) -->
          <div class="pointer-events-none absolute top-8 left-1/4 right-1/4 hidden h-px bg-gradient-to-r from-vn-accent via-vn-accent2 to-vn-accent opacity-25 lg:block"></div>

          <div v-for="i in 4" :key="i" class="reveal-item reveal-stagger-item p-6 text-center opacity-0">
            <button
              type="button"
              class="mb-6 flex h-16 w-16 items-center justify-center rounded-full border font-display text-lg font-extrabold transition-all lg:mx-auto"
              :class="stepIndex === i - 1 ? 'border-vn-accent bg-vn-accent text-vn-black' : 'border-vn-border2 bg-vn-surface text-vn-white hover:border-vn-accent hover:text-vn-accent hover:shadow-[0_0_0_4px_rgba(0,229,255,0.08)]'"
              @click="setStep(i - 1)"
            >
              {{ String(i).padStart(2, '0') }}
            </button>
            <h3 v-if="i === 1" class="mb-2 font-display text-base font-bold text-vn-white">Open the canvas</h3>
            <h3 v-else-if="i === 2" class="mb-2 font-display text-base font-bold text-vn-white">Drag event components</h3>
            <h3 v-else-if="i === 3" class="mb-2 font-display text-base font-bold text-vn-white">Connect and configure</h3>
            <h3 v-else class="mb-2 font-display text-base font-bold text-vn-white">Copy the Pointy-lang</h3>

            <p v-if="i === 1" class="text-sm text-vn-muted">Click "New workflow" and choose a name or template. The canvas is ready immediately with the EventHub palette on the left.</p>
            <p v-else-if="i === 2" class="text-sm text-vn-muted">Browse the EventHub palette by category. Drag any EventBase component onto the canvas — it appears as a connected node with source and version badges.</p>
            <p v-else-if="i === 3" class="text-sm text-vn-muted">Draw edges between nodes by dragging from output to input ports. Select any node to set annotations, executors, and retry counts in the properties panel.</p>
            <p v-else class="text-sm text-vn-muted">The live output panel shows production-ready Pointy-lang at all times. Copy it, run it with <code class="rounded bg-vn-black/60 px-1 py-0.5 font-mono text-xs text-vn-accent">volnux trigger_engine start</code>, and your workflow is live.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Output Demo Section -->
    <section id="output-demo" class="vn-section relative z-10 border-y border-vn-border bg-vn-surface">
      <div class="vn-container">
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div class="reveal-item">
            <p class="vn-section-tag">Live output</p>
            <h2 class="mb-5 font-display text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold leading-tight tracking-tight text-vn-white">
              The canvas <span class="text-vn-accent">is the code.</span>
            </h2>
            <p class="mb-3 text-sm font-light leading-relaxed text-vn-muted">As you drag, connect, and configure on the canvas, the Pointy-lang Wizard generates the exact workflow definition that will run on the Volnux runtime — including source references, version pins, node annotations, executor declarations, retry counts, and conditional branches.</p>
            <p class="mb-6 text-sm font-light leading-relaxed text-vn-muted">There is no translation layer and no code generation step. What you see in the output panel is what runs in production. Export it, version it, put it in your repository. It is a valid Pointy-lang workflow file.</p>
            <ul class="flex flex-col gap-3">
              <li class="flex items-start gap-3 text-sm text-vn-muted"><span class="mt-0.5 text-vn-accent">→</span>Source prefix automatically included from palette metadata</li>
              <li class="flex items-start gap-3 text-sm text-vn-muted"><span class="mt-0.5 text-vn-accent">→</span>Version pins taken from the EventHub component version shown in the palette</li>
              <li class="flex items-start gap-3 text-sm text-vn-muted"><span class="mt-0.5 text-vn-accent">→</span>Node and executor annotations written from the properties panel</li>
              <li class="flex items-start gap-3 text-sm text-vn-muted"><span class="mt-0.5 text-vn-accent">→</span>Retry counts expressed as <code class="font-mono text-vn-accent">* N</code> inline on the relevant node</li>
              <li class="flex items-start gap-3 text-sm text-vn-muted"><span class="mt-0.5 text-vn-accent">→</span>Fan-out connections become <code class="font-mono text-vn-accent">|-></code> operators automatically</li>
              <li class="flex items-start gap-3 text-sm text-vn-muted"><span class="mt-0.5 text-vn-accent">→</span>Full Pointy-lang comment header generated with workflow name and timestamp</li>
            </ul>
          </div>

          <div class="reveal-item">
            <div class="relative overflow-hidden rounded-lg border border-vn-border bg-vn-black">
              <div class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-vn-accent to-vn-accent2"></div>
              <div class="flex items-center gap-2 border-b border-vn-border px-4 py-3 bg-vn-black/60">
                <span class="h-2 w-2 rounded-full bg-[#ff5f57]"></span>
                <span class="h-2 w-2 rounded-full bg-[#ffbd2e]"></span>
                <span class="h-2 w-2 rounded-full bg-[#28c840]"></span>
                <div class="ml-auto flex items-center gap-2 font-mono text-[0.6rem] text-vn-muted">
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-vn-accent3"></span>
                  my-etl-pipeline.pointy — live output
                </div>
              </div>
              <div class="p-6 font-mono text-sm leading-loose">
                <span class="text-vn-fog"># my-etl-pipeline.pointy</span><br>
                <span class="text-vn-fog"># generated by Pointy-lang Wizard</span><br>
                <br>
                <span class="text-vn-fog"># AI-assisted pipeline with parallel fan-out</span><br>
                <span class="text-vn-accent3">hub</span><span class="text-vn-attr">:RestApiExtract@latest</span><br>
                &nbsp;&nbsp;<span class="text-vn-accent">-></span> <span class="text-vn-white">ClassifyIntent</span><span class="text-vn-attr">[node=<span class="text-vn-pink">"gpu-cluster"</span>]</span><br>
                &nbsp;&nbsp;<span class="text-vn-accent">-></span> <span class="text-vn-white">RouteDecision</span>(<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-vn-accent3">ai_route</span> <span class="text-vn-accent">-></span> <span class="text-vn-white">GPT4Transform</span><span class="text-vn-attr">[executor=<span class="text-vn-pink">"celery"</span>]</span> <span class="text-[#fdcb6e]">* 3</span><br>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-vn-accent">-></span> <span class="text-vn-white">SlackNotify</span>,<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-vn-accent3">direct</span> <span class="text-vn-accent">-></span> <span class="text-vn-white">SlackNotify</span><br>
                &nbsp;&nbsp;)
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Ecosystem Section -->
    <section id="ecosystem" class="vn-section relative z-10">
      <div class="vn-container">
        <div class="reveal-item mb-12 grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <p class="vn-section-tag">Built for the Volnux ecosystem</p>
            <h2 class="font-display text-[clamp(1.8rem,3vw,2.75rem)] font-extrabold leading-tight tracking-tight text-vn-white">
              Part of the<br /><span class="text-vn-accent">full platform.</span>
            </h2>
          </div>
          <div class="flex items-end">
            <p class="text-sm font-light leading-relaxed text-vn-muted">The Wizard does not stand alone. It is one layer of the Volnux stack — connected to EventHub for components, the Volnux runtime for execution, and the Pointy-lang compiler for validation. Your visual workflow plugs into everything.</p>
          </div>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="(card, i) in [
            { icon: 'M10 2L3 6v8l7 4 7-4V6L10 2z', iconBg: 'rgba(255,184,48,0.1)', iconBorder: 'rgba(255,184,48,0.2)', iconColor: '#ffb830', title: 'EventHub integration', desc: 'The palette is a live view of the EventHub registry. Every draggable component corresponds to a real, versioned EventBase class that the Volnux runtime can pull at execution time.' },
            { icon: 'M4 10h12M12 6l4 4-4 4', iconBg: 'rgba(0,229,255,0.1)', iconBorder: 'rgba(0,229,255,0.2)', iconColor: '#00e5ff', title: 'Pointy-lang compiler', desc: 'The generated Pointy-lang is valid, production-ready code. Run it directly with the Volnux CLI — volnux trigger_engine start — no intermediate steps required.' },
            { icon: 'M10 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0 0v4m0 0l3 3', iconBg: 'rgba(123,97,255,0.1)', iconBorder: 'rgba(123,97,255,0.2)', iconColor: '#7b61ff', title: 'Volnux runtime', desc: 'Every node annotation set in the Wizard — node=, executor= — is respected by the Volnux P2P mesh. Your visual dispatch decisions become real infrastructure routing.' },
            { icon: 'M3 4h14v12H3V4zm4 4h6M7 11h4', iconBg: 'rgba(0,255,148,0.1)', iconBorder: 'rgba(0,255,148,0.2)', iconColor: '#00ff94', title: 'Governance built in', desc: 'Workflows built in the Wizard are governed by design — the Pointy-lang output is readable by any stakeholder, and the Volnux runtime produces a complete OTEL trace for every execution.' },
            { icon: 'M10 4v6l4 2', iconBg: 'rgba(255,110,180,0.1)', iconBorder: 'rgba(255,110,180,0.2)', iconColor: '#ff6eb4', title: 'Version control friendly', desc: 'The Pointy-lang output is a plain text file. Put it in your repository, diff it, review it in a pull request. The Wizard generates code you can maintain like any other source file.' },
            { icon: 'M3 10h14M10 3v14', iconBg: 'rgba(255,184,48,0.1)', iconBorder: 'rgba(255,184,48,0.2)', iconColor: '#ffb830', title: 'Extensible palette', desc: 'Publish your own EventBase classes to EventHub and they appear automatically in the Wizard palette — for your team, your organisation, or the entire community.' },
          ]" :key="i" class="reveal-item reveal-stagger-item rounded-lg border border-vn-border bg-vn-surface p-7 opacity-0 transition-colors hover:border-vn-border2 hover:bg-vn-surface2">
            <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-md font-mono text-[0.65rem] font-medium" :style="{ background: card.iconBg, border: `1px solid ${card.iconBorder}`, color: card.iconColor }">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path :d="card.icon" /></svg>
            </div>
            <h4 class="mb-2 font-display text-base font-bold tracking-tight text-vn-white">{{ card.title }}</h4>
            <p class="text-sm leading-relaxed text-vn-muted">{{ card.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section id="cta" class="relative z-10 overflow-hidden border-t border-vn-border bg-vn-surface py-20 text-center lg:py-32">
      <div class="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full" style="background: radial-gradient(circle, rgba(123,97,255,0.06) 0%, transparent 65%);"></div>

      <div class="vn-container relative z-10">
        <div class="reveal-item mx-auto max-w-xl">
          <span class="mb-6 block font-mono text-5xl leading-none tracking-tight text-vn-accent/15">→ → →</span>
          <p class="vn-section-tag mx-auto justify-center">Ready to build?</p>
          <h2 class="mb-5 font-display text-[clamp(2.2rem,4vw,3.5rem)] font-extrabold leading-tight tracking-tight text-vn-white">
            Open the canvas.<br /><span class="text-vn-accent">Ship your workflow.</span>
          </h2>
          <p class="mb-8 text-base font-light leading-relaxed text-vn-muted">The Wizard is available now in early access — free, in-browser, no installation required. Build your first governed workflow in under five minutes.</p>
          <div class="flex flex-wrap justify-center gap-3">
            <a href="/wizard" class="vn-btn-primary inline-flex items-center gap-2">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 1.5l6.5 3.5L2 8.5V1.5z" fill="currentColor"/></svg>
              Open the wizard
            </a>
            <RouterLink to="/products/eventhub" class="vn-btn-outline">Browse EventHub →</RouterLink>
            <RouterLink to="/" class="vn-btn-outline">Volnux platform →</RouterLink>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes slideLeft {
  from { opacity: 0; transform: translateX(-24px); }
  to { opacity: 1; transform: translateX(0); }
}

@keyframes tickerScroll {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

.ticker-track {
  animation: tickerScroll 28s linear infinite;
}

.ticker-snippet {
  display: flex;
  align-items: center;
  gap: 0;
  padding: 0 2rem;
  font-family: 'DM Mono', monospace;
  font-size: 0.72rem;
  border-right: 1px solid rgba(245, 242, 236, 0.1);
}

.ts-arr { color: #00e5ff; margin: 0 0.3rem; }
.ts-nd { color: #f5f2ec; }
.ts-op { color: #7b61ff; margin: 0 0.3rem; }
.ts-meta { color: #00ff94; }
.ts-ann { color: #ffb830; }
.ts-rt { color: #fdcb6e; margin-left: 0.3rem; }
.ts-str { color: #fd9fca; }

.browser-chrome:hover {
  transform: perspective(1200px) rotateY(0deg) rotateX(0deg);
}

.reveal-item {
  opacity: 0;
  transform: translateY(20px);
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
  transform: translateY(14px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.reveal-stagger-item.opacity-100 {
  opacity: 1;
}

.reveal-stagger-item.translate-y-0 {
  transform: translateY(0);
}
</style>
