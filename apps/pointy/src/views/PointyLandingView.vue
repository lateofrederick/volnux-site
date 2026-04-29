<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

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
    <section id="hero" class="relative flex min-h-screen items-center overflow-hidden py-12">
      <!-- Background glow blobs -->
      <div class="pointer-events-none absolute -left-24 -top-24 h-[700px] w-[700px] rounded-full" style="background: radial-gradient(circle, rgba(123,97,255,0.07) 0%, transparent 65%);"></div>
      <div class="pointer-events-none absolute bottom-0 right-[10%] h-[500px] w-[500px] rounded-full" style="background: radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 65%);"></div>

      <div class="w-full max-w-7xl mx-auto px-6 sm:px-8">
        <div class="grid items-center gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
          <!-- LEFT: App screenshot -->
          <div class="reveal-item opacity-0" style="animation: slideLeft 0.8s cubic-bezier(0.22,1,0.36,1) 0.1s both;">
            <div class="relative">
              <div class="absolute -inset-5 rounded-2xl" style="background: radial-gradient(circle, rgba(123,97,255,0.15) 0%, transparent 70%);"></div>
              <div class="browser-chrome group relative overflow-hidden rounded-xl border border-[rgba(245,242,236,0.1)] bg-[#141820] shadow-2xl" style="transform: perspective(1200px) rotateY(2deg) rotateX(1.5deg); transition: transform 0.4s ease;">
                <div class="flex h-9 items-center gap-1.5 border-b border-[rgba(245,242,236,0.1)] bg-[#1a1f2a] px-4">
                  <span class="h-2.5 w-2.5 rounded-full bg-[#ff5f57]"></span>
                  <span class="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]"></span>
                  <span class="h-2.5 w-2.5 rounded-full bg-[#28c840]"></span>
                  <div class="mx-3 flex flex-1 items-center gap-1 rounded border border-[rgba(245,242,236,0.1)] bg-[#0f1318] px-3 py-0.5">
                    <svg class="h-2 w-2 text-[#00ff94]" viewBox="0 0 8 8" fill="none"><rect x="1" y="3.5" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1"/><path d="M2.5 3.5V2.5a1.5 1.5 0 0 1 3 0V3.5" stroke="currentColor" stroke-width="1"/></svg>
                    <span class="font-mono text-[0.6rem] text-[rgba(245,242,236,0.4)]">app.volnux.dev/wizard</span>
                  </div>
                </div>
                <div class="flex min-h-[220px] items-center justify-center bg-gradient-to-br from-[#141a28] to-[#0b0e14] font-mono text-[0.78rem] uppercase tracking-wider text-[rgba(0,229,255,0.35)]">
                  Wizard preview (screenshot)
                </div>
              </div>
            </div>
          </div>

          <!-- RIGHT: Text -->
          <div class="reveal-item opacity-0" style="animation: fadeUp 0.7s ease 0.3s both;">
            <div class="mb-7 inline-flex items-center gap-2 rounded-sm border border-[rgba(123,97,255,0.25)] bg-[rgba(123,97,255,0.07)] px-3 py-1.5 font-mono text-[0.68rem] uppercase tracking-wider text-[#7b61ff]">
              <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-[#7b61ff]"></span>
              Volnux — Visual tooling
            </div>

            <h1 class="mb-6 font-bold text-[clamp(2.5rem,4.5vw,3.75rem)] leading-[1.08] tracking-tight text-[#f5f2ec]">
              Build workflows<br />
              <em class="not-italic text-[#00e5ff]">visually.</em><br />
              <span class="text-[rgba(245,242,236,0.6)]">Ship Pointy-lang.</span>
            </h1>

            <p class="mb-9 max-w-md text-base font-light leading-relaxed text-[rgba(245,242,236,0.65)]">
              Pointy-lang Wizard is a visual canvas for building Volnux workflows without writing code. Drag EventHub components onto the canvas, connect them with edges, configure node annotations — and watch production-ready Pointy-lang generate in real time.
            </p>

            <div class="mb-10 flex flex-wrap gap-3">
              <a href="/wizard" class="inline-flex items-center gap-2 rounded-sm bg-[#00e5ff] px-5 py-3 font-mono text-sm font-medium text-[#0a0c10] transition-all hover:-translate-y-0.5 hover:bg-[#33eaff]">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 1.5l6.5 3.5L2 8.5V1.5z" fill="currentColor"/></svg>
                Try the wizard
              </a>
              <a href="#features" class="inline-flex items-center gap-2 rounded-sm border border-[rgba(245,242,236,0.2)] px-5 py-3 font-mono text-sm text-[rgba(245,242,236,0.8)] transition-all hover:border-[#00e5ff] hover:text-[#00e5ff]">
                See all features →
              </a>
            </div>

            <div class="flex gap-7 border-t border-[rgba(245,242,236,0.1)] pt-7">
              <div>
                <div class="mb-1 text-2xl font-bold leading-none tracking-tight text-[#f5f2ec]">30<span class="text-[#00e5ff]">+</span></div>
                <div class="font-mono text-[0.6rem] uppercase tracking-wider text-[rgba(245,242,236,0.4)]">EventHub components</div>
              </div>
              <div>
                <div class="mb-1 text-2xl font-bold leading-none tracking-tight text-[#f5f2ec]">0</div>
                <div class="font-mono text-[0.6rem] uppercase tracking-wider text-[rgba(245,242,236,0.4)]">Lines of code to write</div>
              </div>
              <div>
                <div class="mb-1 text-2xl font-bold leading-none tracking-tight text-[#f5f2ec]">Live</div>
                <div class="font-mono text-[0.6rem] uppercase tracking-wider text-[rgba(245,242,236,0.4)]">Pointy-lang output</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Pointy Ticker -->
    <div class="relative z-10 flex h-10 items-center overflow-hidden border-y border-[rgba(245,242,236,0.1)] bg-[#141820]">
      <div class="pointer-events-none absolute inset-y-0 left-0 z-20 w-20 bg-gradient-to-r from-[#141820] to-transparent"></div>
      <div class="pointer-events-none absolute inset-y-0 right-0 z-20 w-20 bg-gradient-to-l from-[#141820] to-transparent"></div>
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
    <section id="intro" class="relative z-10 py-28">
      <div class="w-full max-w-7xl mx-auto px-6 sm:px-8">
        <div class="grid items-start gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <!-- Left: Sticky -->
          <div class="reveal-item opacity-0 lg:sticky lg:top-20">
            <p class="mb-4 flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#00e5ff]">
              <span class="h-px w-5 bg-[#00e5ff]"></span>
              What it is
            </p>
            <h2 class="mb-4 text-[clamp(1.8rem,3vw,2.75rem)] font-extrabold leading-tight tracking-tight text-[#f5f2ec]">
              A canvas for<br /><span class="text-[#00e5ff]">Pointy-lang.</span>
            </h2>
            <p class="text-sm font-light leading-relaxed text-[rgba(245,242,236,0.65)]">
              The Wizard bridges the gap between visual authoring and production workflow code. You design — it writes the language.
            </p>
          </div>

          <!-- Right: Info blocks -->
          <div class="space-y-12">
            <div class="reveal-item reveal-stagger-item border-b border-[rgba(245,242,236,0.1)] pb-12 opacity-0">
              <h3 class="mb-3 flex items-center gap-3 text-lg font-bold tracking-tight text-[#f5f2ec]">
                <span class="h-2 w-2 rounded-sm bg-[#00e5ff]"></span>
                Visual-first, code-last
              </h3>
              <p class="max-w-xl text-sm font-light leading-relaxed text-[rgba(245,242,236,0.65)]">
                Most workflow tools make you write YAML or Python and then try to visualise it. Pointy-lang Wizard inverts this: you design the workflow visually on a canvas, and the Pointy-lang definition is generated automatically — live, as you build. The code is the output, not the input.
              </p>
            </div>

            <div class="reveal-item reveal-stagger-item border-b border-[rgba(245,242,236,0.1)] pb-12 opacity-0">
              <h3 class="mb-3 flex items-center gap-3 text-lg font-bold tracking-tight text-[#f5f2ec]">
                <span class="h-2 w-2 rounded-sm bg-[#7b61ff]"></span>
                Powered by the EventHub registry
              </h3>
              <p class="max-w-xl text-sm font-light leading-relaxed text-[rgba(245,242,236,0.65)]">
                The left palette is a live window into the EventHub component registry. Every EventBase class published to PyPI, Git, or the community hub appears as a draggable widget with its source, version, and category visible at a glance. Drag, connect, ship.
              </p>
            </div>

            <div class="reveal-item reveal-stagger-item opacity-0">
              <h3 class="mb-3 flex items-center gap-3 text-lg font-bold tracking-tight text-[#f5f2ec]">
                <span class="h-2 w-2 rounded-sm bg-[#00ff94]"></span>
                Made for teams, not just engineers
              </h3>
              <p class="max-w-xl text-sm font-light leading-relaxed text-[rgba(245,242,236,0.65)]">
                Because the output is readable Pointy-lang, the Wizard is not just for engineers. A product manager can sketch a workflow, an engineer can fill in the node annotations, and a compliance officer can review the generated definition — all using the same tool without any shared codebase.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="relative z-10 border-y border-[rgba(245,242,236,0.1)] bg-[#141820] py-28">
      <div class="w-full max-w-7xl mx-auto px-6 sm:px-8">
        <div class="reveal-item mb-16 grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <p class="mb-4 flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#00e5ff]">
              <span class="h-px w-5 bg-[#00e5ff]"></span>
              Features
            </p>
            <h2 class="text-[clamp(1.8rem,3vw,2.75rem)] font-extrabold leading-tight tracking-tight text-[#f5f2ec]">
              Everything you need<br />to <span class="text-[#00e5ff]">build workflows</span><br />visually.
            </h2>
          </div>
          <div class="flex items-end">
            <p class="text-sm font-light leading-relaxed text-[rgba(245,242,236,0.65)]">
              The Wizard is a complete visual authoring environment — not a diagram tool. Every element on the canvas maps directly to executable Pointy-lang syntax, versioned EventHub components, and Volnux runtime annotations.
            </p>
          </div>
        </div>

        <div class="grid gap-px rounded-lg border border-[rgba(245,242,236,0.1)] bg-[rgba(245,242,236,0.1)] sm:grid-cols-2 lg:grid-cols-3">
          <!-- Feature Cards (simplified - 6 cards) -->
          <div v-for="(feature, i) in [
            { color: '#00e5ff', title: 'Drag-and-drop canvas', desc: 'Drop any EventHub component from the left palette directly onto the infinite canvas. Move nodes freely, snap to grid, and rearrange without losing any connections.', icon: 'rects' },
            { color: '#7b61ff', title: 'Visual edge connections', desc: 'Connect nodes by dragging from the output port of one event to the input port of another. Edges render as animated bezier curves with live arrow syntax labels.', icon: 'circles' },
            { color: '#00ff94', title: 'Live Pointy-lang output', desc: 'The bottom panel updates in real time as you build. Every node, edge, annotation, and retry setting is reflected instantly in syntax-highlighted Pointy-lang.', icon: 'play' },
            { color: '#ffb830', title: 'Node properties panel', desc: 'Select any node to edit its name, source, version, node annotation, executor, and retry count in the right-hand properties panel.', icon: 'window' },
            { color: '#ff6eb4', title: 'EventHub palette', desc: 'Browse EventBase components organised by category — Extract, Transform, AI & Agents, Validate, Load, Notify.', icon: 'hex' },
            { color: '#00e5ff', title: 'Workflow templates', desc: 'Start from a blank canvas or choose a pre-built template — ETL Pipeline, AI Agent, or Streaming.', icon: 'grid' },
          ]" :key="i" class="reveal-item reveal-stagger-item relative overflow-hidden bg-[#141820] p-9 opacity-0 transition-colors hover:bg-[#1a1f2a]">
            <div class="absolute inset-x-0 top-0 h-0.5" :style="{ background: feature.color }"></div>
            <div class="mb-5 flex h-11 w-11 items-center justify-center rounded-lg border text-lg" :style="{ borderColor: feature.color + '20', background: feature.color + '10', color: feature.color }">
              {{ i + 1 }}
            </div>
            <h3 class="mb-2 text-base font-bold tracking-tight text-[#f5f2ec]">{{ feature.title }}</h3>
            <p class="text-sm leading-relaxed text-[rgba(245,242,236,0.55)]">{{ feature.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section id="how" class="relative z-10 py-28">
      <div class="w-full max-w-7xl mx-auto px-6 sm:px-8">
        <div class="reveal-item mb-16 text-center">
          <p class="mb-4 flex items-center justify-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#00e5ff]">
            <span class="h-px w-5 bg-[#00e5ff]"></span>
            How it works
            <span class="h-px w-5 bg-[#00e5ff]"></span>
          </p>
          <h2 class="mb-4 text-[clamp(1.8rem,3vw,2.75rem)] font-extrabold leading-tight tracking-tight text-[#f5f2ec]">
            Four steps from<br /><span class="text-[#00e5ff]">canvas to production.</span>
          </h2>
          <p class="mx-auto max-w-md text-sm font-light text-[rgba(245,242,236,0.65)]">From opening the Wizard to deploying a governed Volnux workflow — no Python, no YAML, no boilerplate.</p>
        </div>

        <div class="relative grid sm:grid-cols-2 lg:grid-cols-4">
          <div class="pointer-events-none absolute top-8 left-1/4 right-1/4 hidden h-px bg-gradient-to-r from-[#00e5ff] via-[#7b61ff] to-[#00e5ff] opacity-25 lg:block"></div>

          <div v-for="i in 4" :key="i" class="reveal-item reveal-stagger-item p-6 text-center opacity-0">
            <button type="button" class="mb-6 flex h-16 w-16 items-center justify-center rounded-full border font-extrabold transition-all lg:mx-auto" :class="stepIndex === i - 1 ? 'border-[#00e5ff] bg-[#00e5ff] text-[#0a0c10]' : 'border-[rgba(245,242,236,0.15)] bg-[#141820] text-[#f5f2ec] hover:border-[#00e5ff] hover:text-[#00e5ff] hover:shadow-[0_0_0_4px_rgba(0,229,255,0.08)]'" @click="setStep(i - 1)">
              {{ String(i).padStart(2, '0') }}
            </button>
            <h3 v-if="i === 1" class="mb-2 text-base font-bold text-[#f5f2ec]">Open the canvas</h3>
            <h3 v-else-if="i === 2" class="mb-2 text-base font-bold text-[#f5f2ec]">Drag event components</h3>
            <h3 v-else-if="i === 3" class="mb-2 text-base font-bold text-[#f5f2ec]">Connect and configure</h3>
            <h3 v-else class="mb-2 text-base font-bold text-[#f5f2ec]">Copy the Pointy-lang</h3>

            <p v-if="i === 1" class="text-sm text-[rgba(245,242,236,0.55)]">Click "New workflow" and choose a name or template. The canvas is ready immediately with the EventHub palette on the left.</p>
            <p v-else-if="i === 2" class="text-sm text-[rgba(245,242,236,0.55)]">Browse the EventHub palette by category. Drag any EventBase component onto the canvas — it appears as a connected node.</p>
            <p v-else-if="i === 3" class="text-sm text-[rgba(245,242,236,0.55)]">Draw edges between nodes by dragging from output to input ports. Select any node to set annotations, executors, and retry counts.</p>
            <p v-else class="text-sm text-[rgba(245,242,236,0.55)]">The live output panel shows production-ready Pointy-lang at all times. Copy it and your workflow is live.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Output Demo Section -->
    <section id="output-demo" class="relative z-10 border-y border-[rgba(245,242,236,0.1)] bg-[#141820] py-28">
      <div class="w-full max-w-7xl mx-auto px-6 sm:px-8">
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div class="reveal-item">
            <p class="mb-4 flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#00e5ff]">
              <span class="h-px w-5 bg-[#00e5ff]"></span>
              Live output
            </p>
            <h2 class="mb-5 text-[clamp(1.8rem,3vw,2.5rem)] font-extrabold leading-tight tracking-tight text-[#f5f2ec]">
              The canvas <span class="text-[#00e5ff]">is the code.</span>
            </h2>
            <p class="mb-3 text-sm font-light leading-relaxed text-[rgba(245,242,236,0.65)]">As you drag, connect, and configure on the canvas, the Pointy-lang Wizard generates the exact workflow definition that will run on the Volnux runtime.</p>
            <p class="mb-6 text-sm font-light leading-relaxed text-[rgba(245,242,236,0.65)]">There is no translation layer and no code generation step. What you see in the output panel is what runs in production.</p>
          </div>

          <div class="reveal-item">
            <div class="relative overflow-hidden rounded-lg border border-[rgba(245,242,236,0.1)] bg-[#0a0c10]">
              <div class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#00e5ff] to-[#7b61ff]"></div>
              <div class="flex items-center gap-2 border-b border-[rgba(245,242,236,0.1)] px-4 py-3 bg-[rgba(255,255,255,0.02)]">
                <span class="h-2 w-2 rounded-full bg-[#ff5f57]"></span>
                <span class="h-2 w-2 rounded-full bg-[#ffbd2e]"></span>
                <span class="h-2 w-2 rounded-full bg-[#28c840]"></span>
                <div class="ml-auto flex items-center gap-2 font-mono text-[0.6rem] text-[rgba(245,242,236,0.4)]">
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00ff94]"></span>
                  my-etl-pipeline.pointy — live output
                </div>
              </div>
              <div class="p-6 font-mono text-sm leading-loose">
                <span class="text-[rgba(245,242,236,0.4)]"># my-etl-pipeline.pointy</span><br>
                <span class="text-[rgba(245,242,236,0.4)]"># generated by Pointy-lang Wizard</span><br>
                <br>
                <span class="text-[rgba(245,242,236,0.4)]"># AI-assisted pipeline with parallel fan-out</span><br>
                <span class="text-[#00ff94]">hub</span><span class="text-[#ffb830]">:RestApiExtract@latest</span><br>
                &nbsp;&nbsp;<span class="text-[#00e5ff]">-></span> <span class="text-[#f5f2ec]">ClassifyIntent</span><span class="text-[#ffb830]">[node=<span class="text-[#fd9fca]">"gpu-cluster"</span>]</span><br>
                &nbsp;&nbsp;<span class="text-[#00e5ff]">-></span> <span class="text-[#f5f2ec]">RouteDecision</span>(<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#00ff94]">ai_route</span> <span class="text-[#00e5ff]">-></span> <span class="text-[#f5f2ec]">GPT4Transform</span><span class="text-[#ffb830]">[executor=<span class="text-[#fd9fca]">"celery"</span>]</span> <span class="text-[#fdcb6e]">* 3</span><br>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#00e5ff]">-></span> <span class="text-[#f5f2ec]">SlackNotify</span>,<br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-[#00ff94]">direct</span> <span class="text-[#00e5ff]">-></span> <span class="text-[#f5f2ec]">SlackNotify</span><br>
                &nbsp;&nbsp;)
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Ecosystem Section -->
    <section id="ecosystem" class="relative z-10 py-28">
      <div class="w-full max-w-7xl mx-auto px-6 sm:px-8">
        <div class="reveal-item mb-12 grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <p class="mb-4 flex items-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#00e5ff]">
              <span class="h-px w-5 bg-[#00e5ff]"></span>
              Built for the Volnux ecosystem
            </p>
            <h2 class="text-[clamp(1.8rem,3vw,2.75rem)] font-extrabold leading-tight tracking-tight text-[#f5f2ec]">
              Part of the<br /><span class="text-[#00e5ff]">full platform.</span>
            </h2>
          </div>
          <div class="flex items-end">
            <p class="text-sm font-light leading-relaxed text-[rgba(245,242,236,0.65)]">The Wizard does not stand alone. It is one layer of the Volnux stack — connected to EventHub for components, the Volnux runtime for execution, and the Pointy-lang compiler for validation.</p>
          </div>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="(card, i) in [
            { color: '#ffb830', title: 'EventHub integration', desc: 'The palette is a live view of the EventHub registry. Every draggable component corresponds to a real, versioned EventBase class.' },
            { color: '#00e5ff', title: 'Pointy-lang compiler', desc: 'The generated Pointy-lang is valid, production-ready code. Run it directly with the Volnux CLI.' },
            { color: '#7b61ff', title: 'Volnux runtime', desc: 'Every node annotation set in the Wizard is respected by the Volnux P2P mesh.' },
            { color: '#00ff94', title: 'Governance built in', desc: 'Workflows built in the Wizard are governed by design with complete OTEL traces.' },
            { color: '#ff6eb4', title: 'Version control friendly', desc: 'The Pointy-lang output is a plain text file. Put it in your repository, diff it, review it.' },
            { color: '#ffb830', title: 'Extensible palette', desc: 'Publish your own EventBase classes to EventHub and they appear automatically in the Wizard palette.' },
          ]" :key="i" class="reveal-item reveal-stagger-item rounded-lg border border-[rgba(245,242,236,0.1)] bg-[#141820] p-7 opacity-0 transition-colors hover:border-[rgba(245,242,236,0.15)] hover:bg-[#1a1f2a]">
            <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-md font-mono text-[0.65rem] font-medium" :style="{ background: card.color + '10', border: '1px solid ' + card.color + '20', color: card.color }">
              {{ i + 1 }}
            </div>
            <h4 class="mb-2 text-base font-bold tracking-tight text-[#f5f2ec]">{{ card.title }}</h4>
            <p class="text-sm leading-relaxed text-[rgba(245,242,236,0.55)]">{{ card.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section id="cta" class="relative z-10 overflow-hidden border-t border-[rgba(245,242,236,0.1)] bg-[#141820] py-20 text-center lg:py-32">
      <div class="pointer-events-none absolute left-1/2 top-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full" style="background: radial-gradient(circle, rgba(123,97,255,0.06) 0%, transparent 65%);"></div>

      <div class="w-full max-w-7xl mx-auto px-6 sm:px-8 relative z-10">
        <div class="reveal-item mx-auto max-w-xl">
          <span class="mb-6 block font-mono text-5xl leading-none tracking-tight text-[rgba(0,229,255,0.15)]">→ → →</span>
          <p class="mb-4 flex items-center justify-center gap-3 font-mono text-[0.65rem] uppercase tracking-[0.2em] text-[#00e5ff]">
            <span class="h-px w-5 bg-[#00e5ff]"></span>
            Ready to build?
            <span class="h-px w-5 bg-[#00e5ff]"></span>
          </p>
          <h2 class="mb-5 text-[clamp(2.2rem,4vw,3.5rem)] font-extrabold leading-tight tracking-tight text-[#f5f2ec]">
            Open the canvas.<br /><span class="text-[#00e5ff]">Ship your workflow.</span>
          </h2>
          <p class="mb-8 text-base font-light leading-relaxed text-[rgba(245,242,236,0.65)]">The Wizard is available now in early access — free, in-browser, no installation required. Build your first governed workflow in under five minutes.</p>
          <div class="flex flex-wrap justify-center gap-3">
            <a href="/wizard" class="inline-flex items-center gap-2 rounded-sm bg-[#00e5ff] px-5 py-3 font-mono text-sm font-medium text-[#0a0c10] transition-all hover:-translate-y-0.5 hover:bg-[#33eaff]">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 1.5l6.5 3.5L2 8.5V1.5z" fill="currentColor"/></svg>
              Open the wizard
            </a>
            <a href="https://volnux.netlify.app/products/eventhub" class="inline-flex items-center gap-2 rounded-sm border border-[rgba(245,242,236,0.2)] px-5 py-3 font-mono text-sm text-[rgba(245,242,236,0.8)] transition-all hover:border-[#00e5ff] hover:text-[#00e5ff]">
              Browse EventHub →
            </a>
            <a href="https://volnux.netlify.app/" class="inline-flex items-center gap-2 rounded-sm border border-[rgba(245,242,236,0.2)] px-5 py-3 font-mono text-sm text-[rgba(245,242,236,0.8)] transition-all hover:border-[#00e5ff] hover:text-[#00e5ff]">
              Volnux platform →
            </a>
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
