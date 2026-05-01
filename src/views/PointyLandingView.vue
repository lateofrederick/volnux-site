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
  const color = isDark.value ? '6, 182, 212' : '8, 145, 178'
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
  { value: '30+', label: 'EventHub components' },
  { value: '0', label: 'Lines of code to write' },
  { value: 'Live', label: 'Pointy-lang output' },
]

const introBlocks = [
  { accent: '#06b6d4', title: 'Visual-first, code-last', desc: 'Most workflow tools make you write YAML or Python and then try to visualise it. The Wizard inverts this: you design the workflow visually on a canvas, and the Pointy-lang definition is generated automatically — live, as you build. The code is the output, not the input.' },
  { accent: '#8b5cf6', title: 'Powered by the EventHub registry', desc: 'The left palette is a live window into the EventHub component registry. Every EventBase class published to PyPI, Git, or the community hub appears as a draggable widget with its source, version, and category visible at a glance. Drag, connect, ship.' },
  { accent: '#a855f7', title: 'Made for teams, not just engineers', desc: 'Because the output is readable Pointy-lang, the Wizard is not just for engineers. A product manager can sketch a workflow, an engineer can fill in the node annotations, and a compliance officer can review the generated definition — all using the same tool without any shared codebase.' },
]

const featureAccentMap: Record<string, { top: string; iconBg: string; iconBorder: string; iconColor: string }> = {
  canvas:    { top: '#06b6d4', iconBg: 'rgba(6,182,212,0.1)',  iconBorder: 'rgba(6,182,212,0.2)',  iconColor: '#06b6d4' },
  edges:     { top: '#8b5cf6', iconBg: 'rgba(139,92,246,0.1)', iconBorder: 'rgba(139,92,246,0.2)', iconColor: '#8b5cf6' },
  output:    { top: '#a855f7', iconBg: 'rgba(168,85,247,0.1)', iconBorder: 'rgba(168,85,247,0.2)', iconColor: '#a855f7' },
  props:     { top: '#10b981', iconBg: 'rgba(16,185,129,0.1)', iconBorder: 'rgba(16,185,129,0.2)', iconColor: '#10b981' },
  palette:   { top: '#f472b6', iconBg: 'rgba(244,114,182,0.1)',iconBorder: 'rgba(244,114,182,0.2)',iconColor: '#f472b6' },
  templates: { top: '#f59e0b', iconBg: 'rgba(245,158,11,0.1)', iconBorder: 'rgba(245,158,11,0.2)', iconColor: '#f59e0b' },
  undo:      { top: '#06b6d4', iconBg: 'rgba(6,182,212,0.1)',  iconBorder: 'rgba(6,182,212,0.2)',  iconColor: '#06b6d4' },
  validate:  { top: '#8b5cf6', iconBg: 'rgba(139,92,246,0.1)', iconBorder: 'rgba(139,92,246,0.2)', iconColor: '#8b5cf6' },
  zoom:      { top: '#a855f7', iconBg: 'rgba(168,85,247,0.1)', iconBorder: 'rgba(168,85,247,0.2)', iconColor: '#a855f7' },
}

const features = [
  { key: 'canvas', icon: 'M2 4h7v7H2zM11 9h7v7h-7zM9 7.5h3.5V12', title: 'Drag-and-drop canvas', desc: 'Drop any EventHub component from the left palette directly onto the infinite canvas. Move nodes freely, snap to grid, and rearrange without losing any connections.' },
  { key: 'edges', icon: 'M5 10a3 3 0 1 0 6 0 3 3 0 0 0-6 0zM15 10a3 3 0 1 0 6 0 3 3 0 0 0-6 0zM8 10h4', title: 'Visual edge connections', desc: 'Connect nodes by dragging from the output port of one event to the input port of another. Edges render as animated bezier curves with live arrow syntax labels.' },
  { key: 'output', icon: 'M4 17V4l13 6.5L4 17z', title: 'Live Pointy-lang output', desc: 'The bottom panel updates in real time as you build. Every node, edge, annotation, and retry setting is reflected instantly in syntax-highlighted Pointy-lang.' },
  { key: 'props', icon: 'M2 3h16v14H2zM7 8h6M7 11h4', title: 'Node properties panel', desc: 'Select any node to edit its name, source, version, node annotation, executor, and retry count in the right-hand properties panel — all changes reflected immediately.' },
  { key: 'palette', icon: 'M10 2L3 6v8l7 4 7-4V6L10 2z', title: 'EventHub palette', desc: 'Browse EventBase components organised by category — Extract, Transform, AI & Agents, Validate, Load, Notify. Every widget shows its source registry and version.' },
  { key: 'templates', icon: 'M4 4h12v12H4zM8 8l4 4M12 8l-4 4', title: 'Workflow templates', desc: 'Start from a blank canvas or choose a pre-built template — ETL Pipeline, AI Agent, or Streaming. Templates seed the canvas with connected nodes.' },
  { key: 'undo', icon: 'M3 10a7 7 0 1 0 7-7M3 3v4h4', title: 'Undo and redo', desc: 'Full undo/redo history for every action — drag, connect, delete, annotate. Step back through your design decisions and branch freely.' },
  { key: 'validate', icon: 'M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z', title: 'Real-time validation', desc: 'The Wizard validates your workflow as you build it — missing connections, orphan nodes, and incompatible sources are flagged instantly in the output panel.' },
  { key: 'zoom', icon: 'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0zM10 7v6m-3-3h6', title: 'Canvas zoom and pan', desc: 'Zoom in for precision editing or zoom out to see the full workflow. Pan across the infinite canvas. Fit-to-canvas brings everything into view instantly.' },
]

const howSteps = [
  { num: '01', title: 'Open the canvas', desc: 'Click "New workflow" and choose a name or template. The canvas is ready immediately with the EventHub palette on the left.' },
  { num: '02', title: 'Drag event components', desc: 'Browse the EventHub palette by category. Drag any EventBase component onto the canvas — it appears as a connected node with source and version badges.' },
  { num: '03', title: 'Connect and configure', desc: 'Draw edges between nodes by dragging from output to input ports. Select any node to set annotations, executors, and retry counts in the properties panel.' },
  { num: '04', title: 'Copy the Pointy-lang', desc: 'The live output panel shows production-ready Pointy-lang at all times. Copy it, run it with the Volnux CLI, and your workflow is live.' },
]

const outputFeatures = [
  'Source prefix automatically included from palette metadata',
  'Version pins taken from the EventHub component version',
  'Node and executor annotations written from the properties panel',
  'Retry counts expressed as * N inline on the relevant node',
  'Fan-out connections become |-> operators automatically',
  'Full Pointy-lang comment header generated with workflow name and timestamp',
]

const ecosystemCards = [
  { icon: 'M10 2L3 6v8l7 4 7-4V6L10 2z', accent: '#f59e0b', title: 'EventHub integration', desc: 'The palette is a live view of the EventHub registry. Every draggable component corresponds to a real, versioned EventBase class that the Volnux runtime can pull at execution time.' },
  { icon: 'M4 10h12M12 6l4 4-4 4', accent: '#06b6d4', title: 'Pointy-lang compiler', desc: 'The generated Pointy-lang is valid, production-ready code. Run it directly with the Volnux CLI — no intermediate steps required.' },
  { icon: 'M10 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm0 0v4m0 0l3 3', accent: '#8b5cf6', title: 'Volnux runtime', desc: 'Every node annotation set in the Wizard — node=, executor= — is respected by the Volnux P2P mesh. Your visual dispatch decisions become real infrastructure routing.' },
  { icon: 'M3 4h14v12H3V4zm4 4h6M7 11h4', accent: '#10b981', title: 'Governance built in', desc: 'Workflows built in the Wizard are governed by design — the Pointy-lang output is readable by any stakeholder, and the Volnux runtime produces a complete OTEL trace for every execution.' },
  { icon: 'M10 4v6l4 2', accent: '#f472b6', title: 'Version control friendly', desc: 'The Pointy-lang output is a plain text file. Put it in your repository, diff it, review it in a pull request. The Wizard generates code you can maintain like any other source file.' },
  { icon: 'M3 10h14M10 3v14', accent: '#f59e0b', title: 'Extensible palette', desc: 'Publish your own EventBase classes to EventHub and they appear automatically in the Wizard palette — for your team, your organisation, or the entire community.' },
]

const tickerSnippets = [
  { parts: [{ t: 'nd', v: 'Extract' }, { t: 'arr', v: ' -> ' }, { t: 'nd', v: 'Transform' }, { t: 'arr', v: ' -> ' }, { t: 'nd', v: 'Load' }] },
  { parts: [{ t: 'nd', v: 'LoadUsers' }, { t: 'op', v: ' |-> ' }, { t: 'meta', v: 'MAP' }, { t: 'ann', v: '<ValidateProfile>' }] },
  { parts: [{ t: 'nd', v: 'Ingest' }, { t: 'arr', v: ' -> ' }, { t: 'nd', v: 'Process' }, { t: 'txt', v: '(' }, { t: 'meta', v: 'success' }, { t: 'arr', v: ' -> ' }, { t: 'nd', v: 'Save' }, { t: 'txt', v: ', ' }, { t: 'meta', v: 'failure' }, { t: 'arr', v: ' -> ' }, { t: 'nd', v: 'Reject' }, { t: 'txt', v: ')' }] },
  { parts: [{ t: 'nd', v: 'EnrichWithAI' }, { t: 'ann', v: '[node=' }, { t: 'str', v: '"gpu-cluster"' }, { t: 'ann', v: ']' }, { t: 'rt', v: ' * 3' }] },
  { parts: [{ t: 'nd', v: 'KafkaIngest' }, { t: 'op', v: ' |-> ' }, { t: 'meta', v: 'MAP' }, { t: 'ann', v: '<ValidateEvent>' }, { t: 'op', v: ' || ' }, { t: 'nd', v: 'Checkpoint' }] },
  { parts: [{ t: 'nd', v: 'ClassifyIntent' }, { t: 'arr', v: ' -> ' }, { t: 'nd', v: 'RouteAgent' }, { t: 'ann', v: '[executor=' }, { t: 'str', v: '"celery"' }, { t: 'ann', v: ']' }] },
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
      <!-- Background gradients -->
      <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-cyan-50/20 transition-colors duration-300 dark:from-[#0a0a0f] dark:via-[#12121a] dark:to-[#0f0f16]" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.08),transparent_50%)] transition-colors duration-300 dark:bg-[radial-gradient(ellipse_at_top_right,rgba(6,182,212,0.12),transparent_50%)]" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.05),transparent_50%)] transition-colors duration-300 dark:bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.08),transparent_50%)]" />

      <!-- Aurora blobs -->
      <div class="pointer-events-none absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full transition-opacity duration-300" style="background: radial-gradient(circle, rgba(6,182,212,0.10) 0%, transparent 65%);" />
      <div class="pointer-events-none absolute bottom-0 right-[5%] h-[500px] w-[500px] rounded-full transition-opacity duration-300" style="background: radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 65%);" />

      <!-- Mouse spotlight -->
      <div class="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300" :style="spotlightStyle" />

      <!-- Grid pattern -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:60px_60px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />

      <div class="relative z-20 mx-auto w-full max-w-7xl">
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <!-- Left: Copy -->
          <div>
            <div class="reveal-item mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1.5 dark:border-cyan-500/30 dark:bg-cyan-500/10">
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-75" />
                <span class="relative inline-flex h-2 w-2 rounded-full bg-cyan-500" />
              </span>
              <span class="text-sm font-medium text-cyan-700 dark:text-cyan-300">Volnux — Visual tooling</span>
            </div>

            <h1 class="reveal-item mb-6 font-display text-5xl font-bold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
              Build workflows<br />
              <span class="bg-gradient-to-r from-cyan-500 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent dark:from-cyan-400 dark:via-violet-400 dark:to-fuchsia-400">visually.</span><br />
              <span class="text-slate-400 dark:text-slate-500">Ship Pointy-lang.</span>
            </h1>

            <p class="reveal-item mb-8 text-lg leading-relaxed text-slate-600 dark:text-slate-400 sm:text-xl">
              Pointy-lang Wizard is a visual canvas for building Volnux workflows without writing code. Drag
              <span class="font-medium text-cyan-600 dark:text-cyan-400">EventHub</span> components onto the canvas,
              connect them with edges, configure annotations — and watch production-ready Pointy-lang generate in real time.
            </p>

            <div class="reveal-item mb-10 flex flex-col gap-3 sm:flex-row">
              <a href="/wizard" class="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 1.5l6.5 3.5L2 8.5V1.5z" fill="currentColor" /></svg>
                <span class="relative z-10">Try the wizard</span>
                <svg class="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </a>
              <a href="#features" class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/50 px-6 py-3 text-base font-medium text-slate-700 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:text-cyan-400">
                See all features →
              </a>
            </div>

            <div class="reveal-item flex gap-8 border-t border-slate-200 pt-6 dark:border-slate-800">
              <div v-for="stat in heroStats" :key="stat.label">
                <div class="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
                  {{ stat.value }}<span v-if="stat.value === '30+'" class="text-cyan-500">+</span>
                </div>
                <div class="text-sm text-slate-500 dark:text-slate-500">{{ stat.label }}</div>
              </div>
            </div>
          </div>

          <!-- Right: Browser chrome mockup -->
          <div class="reveal-item relative">
            <div class="absolute -inset-1 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 opacity-15 blur-xl transition-opacity duration-300 dark:opacity-20" />

            <div class="wizard-preview relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl transition-colors duration-300 dark:border-slate-800 dark:bg-[#0d0d12]" style="transform: perspective(1200px) rotateY(-2deg) rotateX(1.5deg); transition: transform 0.4s ease;">
              <!-- Browser chrome -->
              <div class="flex items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <div class="flex gap-1.5">
                  <div class="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <div class="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div class="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <div class="ml-3 flex flex-1 items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 px-3 py-1 dark:border-slate-700 dark:bg-slate-900">
                  <svg class="h-3 w-3 text-violet-500" viewBox="0 0 8 8" fill="none"><rect x="1" y="3.5" width="6" height="4" rx="1" stroke="currentColor" stroke-width="1"/><path d="M2.5 3.5V2.5a1.5 1.5 0 0 1 3 0V3.5" stroke="currentColor" stroke-width="1"/></svg>
                  <span class="font-mono text-[0.65rem] text-slate-400 dark:text-slate-500">app.volnux.dev/wizard</span>
                </div>
              </div>

              <!-- Wizard layout mockup -->
              <div class="flex min-h-[280px]">
                <!-- Left palette hint -->
                <div class="w-[90px] flex-shrink-0 border-r border-slate-100 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-900/30">
                  <div class="mb-2 h-5 rounded border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800" />
                  <div class="space-y-1.5">
                    <div class="flex items-center gap-1.5 rounded bg-cyan-50 px-1.5 py-1 dark:bg-cyan-500/5">
                      <div class="h-3 w-3 rounded-sm bg-cyan-500/20" />
                      <div class="h-2 w-10 rounded-sm bg-cyan-500/15" />
                    </div>
                    <div class="flex items-center gap-1.5 rounded bg-violet-50 px-1.5 py-1 dark:bg-violet-500/5">
                      <div class="h-3 w-3 rounded-sm bg-violet-500/20" />
                      <div class="h-2 w-8 rounded-sm bg-violet-500/15" />
                    </div>
                    <div class="flex items-center gap-1.5 rounded bg-pink-50 px-1.5 py-1 dark:bg-pink-500/5">
                      <div class="h-3 w-3 rounded-sm bg-pink-500/20" />
                      <div class="h-2 w-9 rounded-sm bg-pink-500/15" />
                    </div>
                    <div class="flex items-center gap-1.5 rounded bg-emerald-50 px-1.5 py-1 dark:bg-emerald-500/5">
                      <div class="h-3 w-3 rounded-sm bg-emerald-500/20" />
                      <div class="h-2 w-7 rounded-sm bg-emerald-500/15" />
                    </div>
                  </div>
                </div>

                <!-- Canvas area with nodes -->
                <div class="relative flex-1 bg-[radial-gradient(rgba(0,0,0,0.04)_1px,transparent_1px)] bg-[size:20px_20px] dark:bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] dark:bg-[size:20px_20px]">
                  <!-- Simulated node 1 -->
                  <div class="absolute left-6 top-8 w-32 rounded-lg border border-cyan-200 bg-white shadow-md dark:border-cyan-500/30 dark:bg-slate-900/80">
                    <div class="h-1 rounded-t-lg bg-cyan-500" />
                    <div class="flex items-center gap-2 px-2 py-1.5">
                      <div class="h-4 w-4 rounded bg-cyan-100 dark:bg-cyan-500/10" />
                      <span class="font-mono text-[0.6rem] font-medium text-slate-700 dark:text-slate-300">RestApiExtract</span>
                    </div>
                    <div class="border-t border-slate-100 px-2 py-1 dark:border-slate-800">
                      <span class="font-mono text-[0.5rem] text-slate-400">pypi · v2.1</span>
                    </div>
                  </div>

                  <!-- Simulated node 2 -->
                  <div class="absolute left-20 top-28 w-32 rounded-lg border border-violet-200 bg-white shadow-md dark:border-violet-500/30 dark:bg-slate-900/80">
                    <div class="h-1 rounded-t-lg bg-violet-500" />
                    <div class="flex items-center gap-2 px-2 py-1.5">
                      <div class="h-4 w-4 rounded bg-violet-100 dark:bg-violet-500/10" />
                      <span class="font-mono text-[0.6rem] font-medium text-slate-700 dark:text-slate-300">GPT4Transform</span>
                    </div>
                    <div class="border-t border-slate-100 px-2 py-1 dark:border-slate-800">
                      <span class="font-mono text-[0.5rem] text-amber-500">[node="gpu"]</span>
                    </div>
                  </div>

                  <!-- Simulated node 3 -->
                  <div class="absolute left-[140px] top-[130px] w-32 rounded-lg border border-amber-200 bg-white shadow-md dark:border-amber-500/30 dark:bg-slate-900/80">
                    <div class="h-1 rounded-t-lg bg-amber-500" />
                    <div class="flex items-center gap-2 px-2 py-1.5">
                      <div class="h-4 w-4 rounded bg-amber-100 dark:bg-amber-500/10" />
                      <span class="font-mono text-[0.6rem] font-medium text-slate-700 dark:text-slate-300">SnowflakeLoad</span>
                    </div>
                    <div class="border-t border-slate-100 px-2 py-1 dark:border-slate-800">
                      <span class="font-mono text-[0.5rem] text-slate-400">hub · v1.0</span>
                    </div>
                  </div>

                  <!-- Connection hint line -->
                  <svg class="pointer-events-none absolute inset-0 h-full w-full" style="z-index: 0;">
                    <line x1="70" y1="55" x2="95" y2="100" stroke="rgba(6,182,212,0.3)" stroke-width="2" stroke-dasharray="4 3" />
                    <line x1="120" y1="130" x2="175" y2="165" stroke="rgba(139,92,246,0.3)" stroke-width="2" stroke-dasharray="4 3" />
                  </svg>
                </div>

                <!-- Right panel hint -->
                <div class="w-[80px] flex-shrink-0 border-l border-slate-100 bg-slate-50/50 p-2 dark:border-slate-800 dark:bg-slate-900/30">
                  <div class="mb-2 font-mono text-[0.5rem] uppercase tracking-wider text-slate-400 dark:text-slate-600">Props</div>
                  <div class="space-y-1.5">
                    <div class="h-3 rounded-sm bg-slate-200 dark:bg-slate-800" />
                    <div class="h-3 w-3/4 rounded-sm bg-slate-200 dark:bg-slate-800" />
                    <div class="h-3 w-1/2 rounded-sm bg-slate-200 dark:bg-slate-800" />
                    <div class="mt-3 h-3 rounded-sm bg-cyan-100 dark:bg-cyan-500/10" />
                    <div class="h-3 w-2/3 rounded-sm bg-cyan-100 dark:bg-cyan-500/10" />
                  </div>
                </div>
              </div>

              <!-- Bottom output panel -->
              <div class="border-t border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-[#0a0a0f]">
                <div class="mb-1 flex items-center gap-2">
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  <span class="font-mono text-[0.55rem] text-slate-400 dark:text-slate-500">Pointy-lang output — live</span>
                </div>
                <div class="font-mono text-[0.58rem] leading-relaxed text-slate-600 dark:text-slate-400">
                  <span class="text-slate-400 dark:text-slate-500"># my-etl-pipeline.pointy</span><br>
                  <span class="text-cyan-600 dark:text-cyan-400">hub</span><span class="text-amber-600 dark:text-amber-300">:RestApiExtract@latest</span><br>
                  &nbsp;&nbsp;<span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-slate-700 dark:text-slate-300">GPT4Transform</span><span class="text-amber-600 dark:text-amber-300">[node=<span class="text-pink-600 dark:text-pink-300">"gpu-cluster"</span>]</span>
                </div>
              </div>
            </div>

            <!-- Floating badge -->
            <div class="absolute -left-4 top-12 rounded-lg border border-slate-200 bg-white p-3 shadow-xl transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900">
              <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-cyan-500 to-violet-600 text-xs font-bold text-white">W</div>
                <div class="text-xs">
                  <div class="font-medium text-slate-900 dark:text-white">Wizard</div>
                  <div class="text-slate-500">Active</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         POINTY TICKER
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
         WHAT IT IS
         ============================================ -->
    <section id="intro" class="relative py-16 transition-colors duration-300 dark:bg-[#0a0a0f]">
      <div class="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white opacity-50 transition-colors duration-300 dark:from-[#0a0a0f] dark:via-[#0c0c10] dark:to-[#0a0a0f] dark:opacity-100" />

      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid items-start gap-12 lg:grid-cols-[1fr_2fr] lg:gap-20">
          <!-- Left: Sticky -->
          <div class="reveal-item lg:sticky lg:top-24">
            <span class="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">What it is</span>
            <h2 class="mb-4 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              A canvas for<br />
              <span class="bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent dark:from-cyan-400 dark:to-violet-400">Pointy-lang.</span>
            </h2>
            <p class="text-slate-600 dark:text-slate-400">
              The Wizard bridges the gap between visual authoring and production workflow code. You design — it writes the language.
            </p>
          </div>

          <!-- Right: Info blocks -->
          <div class="space-y-0 divide-y divide-slate-200 dark:divide-slate-800">
            <div v-for="(block, i) in introBlocks" :key="i" class="reveal-item reveal-stagger-item py-10 first:pt-0 last:pb-0 opacity-0">
              <h3 class="mb-3 flex items-center gap-3 font-display text-lg font-bold text-slate-900 dark:text-white">
                <span class="h-2 w-2 rounded-sm" :style="{ background: block.accent }" />
                {{ block.title }}
              </h3>
              <p class="max-w-xl text-slate-600 dark:text-slate-400">
                {{ block.desc }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         FEATURES
         ============================================ -->
    <section id="features" class="relative border-y border-slate-200 bg-slate-50/50 py-16 transition-colors duration-300 dark:border-slate-800/50 dark:bg-[#0c0c10]">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal-item mb-12 grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <span class="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">Features</span>
            <h2 class="font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Everything you need<br />to
              <span class="bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent dark:from-cyan-400 dark:to-violet-400">build workflows</span><br />visually.
            </h2>
          </div>
          <div class="flex items-end">
            <p class="text-slate-600 dark:text-slate-400">
              The Wizard is a complete visual authoring environment — not a diagram tool. Every element on the canvas maps directly to executable Pointy-lang syntax, versioned EventHub components, and Volnux runtime annotations.
            </p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(feat, i) in features"
            :key="feat.key"
            class="reveal-item reveal-stagger-item group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-cyan-500/20 dark:hover:shadow-cyan-500/5 opacity-0"
            :style="{ transitionDelay: `${i * 50}ms` }"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div class="absolute inset-x-0 top-0 h-0.5 transition-all duration-300" :style="{ background: featureAccentMap[feat.key]?.top || '#06b6d4' }" />
            <div class="relative">
              <div
                class="mb-4 flex h-11 w-11 items-center justify-center rounded-lg"
                :style="{ background: featureAccentMap[feat.key]?.iconBg, border: `1px solid ${featureAccentMap[feat.key]?.iconBorder}`, color: featureAccentMap[feat.key]?.iconColor }"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path :d="feat.icon" /></svg>
              </div>
              <h3 class="mb-2 font-display text-base font-bold text-slate-900 dark:text-white">{{ feat.title }}</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">{{ feat.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         HOW IT WORKS
         ============================================ -->
    <section id="how" class="relative py-16 transition-colors duration-300 dark:bg-[#0a0a0f]">
      <div class="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white opacity-50 transition-colors duration-300 dark:from-[#0a0a0f] dark:via-[#0c0c10] dark:to-[#0a0a0f] dark:opacity-100" />

      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal-item mb-12 text-center">
          <span class="mb-2 text-xs font-semibold uppercase tracking-widest text-cyan-600 dark:text-cyan-400">How it works</span>
          <h2 class="mb-4 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Four steps from<br />
            <span class="bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent dark:from-cyan-400 dark:to-violet-400">canvas to production.</span>
          </h2>
          <p class="mx-auto max-w-md text-slate-600 dark:text-slate-400">From opening the Wizard to deploying a governed Volnux workflow — no Python, no YAML, no boilerplate.</p>
        </div>

        <div class="relative grid sm:grid-cols-2 lg:grid-cols-4">
          <!-- Connecting line -->
          <div class="pointer-events-none absolute top-10 left-[12.5%] right-[12.5%] hidden h-px bg-gradient-to-r from-cyan-500/30 via-violet-500/30 to-fuchsia-500/30 lg:block" />

          <div
            v-for="(step, i) in howSteps"
            :key="step.num"
            class="reveal-item reveal-stagger-item p-6 text-center opacity-0"
            :style="{ transitionDelay: `${i * 100}ms` }"
          >
            <button
              type="button"
              class="mb-5 flex h-16 w-16 items-center justify-center rounded-full border-2 font-display text-lg font-extrabold transition-all duration-300 lg:mx-auto"
              :class="activeStep === i
                ? 'border-cyan-500 bg-gradient-to-br from-cyan-500 to-violet-600 text-white shadow-lg shadow-cyan-500/25'
                : 'border-slate-200 bg-white text-slate-900 hover:border-cyan-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:hover:border-cyan-500/30'"
              @click="activeStep = i"
            >
              {{ step.num }}
            </button>
            <h3 class="mb-2 font-display text-base font-bold text-slate-900 dark:text-white">{{ step.title }}</h3>
            <p class="text-sm text-slate-600 dark:text-slate-400">{{ step.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         LIVE OUTPUT DEMO
         ============================================ -->
    <section id="output-demo" class="relative border-y border-slate-200 bg-slate-50/50 py-16 transition-colors duration-300 dark:border-slate-800/50 dark:bg-[#0c0c10]">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal-item grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <!-- Left: Copy -->
          <div>
            <span class="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Live output</span>
            <h2 class="mb-5 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              The canvas <span class="bg-gradient-to-r from-cyan-500 to-emerald-500 bg-clip-text text-transparent dark:from-cyan-400 dark:to-emerald-400">is the code.</span>
            </h2>
            <p class="mb-3 text-slate-600 dark:text-slate-400">
              As you drag, connect, and configure on the canvas, the Pointy-lang Wizard generates the exact workflow definition that will run on the Volnux runtime — including source references, version pins, node annotations, executor declarations, retry counts, and conditional branches.
            </p>
            <p class="mb-6 text-slate-600 dark:text-slate-400">
              There is no translation layer and no code generation step. What you see in the output panel is what runs in production. Export it, version it, put it in your repository. It is a valid Pointy-lang workflow file.
            </p>
            <ul class="space-y-3">
              <li v-for="f in outputFeatures" :key="f" class="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-cyan-600 dark:text-cyan-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                <span>{{ f }}</span>
              </li>
            </ul>
          </div>

          <!-- Right: Code block -->
          <div class="relative">
            <div class="absolute -inset-2 rounded-xl bg-gradient-to-r from-cyan-500/20 to-violet-500/20 blur-xl" />

            <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-[#0a0a0f]">
              <div class="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-cyan-500 to-violet-500" />
              <div class="flex items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
                <div class="flex gap-1.5">
                  <div class="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                  <div class="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                  <div class="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                </div>
                <div class="ml-auto flex items-center gap-2 font-mono text-[0.6rem] text-slate-400 dark:text-slate-500">
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-violet-500" />
                  my-etl-pipeline.pointy — live output
                </div>
              </div>
              <div class="p-5 font-mono text-sm leading-loose">
                <span class="text-slate-400 dark:text-slate-500"># my-etl-pipeline.pointy</span><br>
                <span class="text-slate-400 dark:text-slate-500"># generated by Pointy-lang Wizard</span><br>
                <br>
                <span class="text-slate-400 dark:text-slate-500"># AI-assisted pipeline with parallel fan-out</span><br>
                <span class="text-cyan-600 dark:text-cyan-400">hub</span><span class="text-amber-600 dark:text-amber-300">:RestApiExtract@latest</span><br>
                &nbsp;&nbsp;<span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-slate-800 dark:text-white">ClassifyIntent</span><span class="text-amber-600 dark:text-amber-300">[node=<span class="text-pink-600 dark:text-pink-300">"gpu-cluster"</span>]</span><br>
                &nbsp;&nbsp;<span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-slate-800 dark:text-white">RouteDecision</span><span class="text-slate-500 dark:text-slate-300">(</span><br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-emerald-600 dark:text-emerald-400">ai_route</span> <span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-slate-800 dark:text-white">GPT4Transform</span><span class="text-amber-600 dark:text-amber-300">[executor=<span class="text-pink-600 dark:text-pink-300">"celery"</span>]</span> <span class="text-amber-600 dark:text-amber-300">* 3</span><br>
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-slate-800 dark:text-white">SlackNotify</span><span class="text-slate-500 dark:text-slate-300">,</span><br>
                &nbsp;&nbsp;&nbsp;&nbsp;<span class="text-emerald-600 dark:text-emerald-400">direct</span> <span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-slate-800 dark:text-white">SlackNotify</span><br>
                &nbsp;&nbsp;<span class="text-slate-500 dark:text-slate-300">)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         ECOSYSTEM
         ============================================ -->
    <section id="ecosystem" class="relative py-16 transition-colors duration-300 dark:bg-[#0a0a0f]">
      <div class="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white opacity-50 transition-colors duration-300 dark:from-[#0a0a0f] dark:via-[#0c0c10] dark:to-[#0a0a0f] dark:opacity-100" />

      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal-item mb-12 grid gap-8 lg:grid-cols-2 lg:gap-16">
          <div>
            <span class="mb-2 text-xs font-semibold uppercase tracking-widest text-violet-600 dark:text-violet-400">Built for the Volnux ecosystem</span>
            <h2 class="font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Part of the<br />
              <span class="bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent dark:from-cyan-400 dark:to-violet-400">full platform.</span>
            </h2>
          </div>
          <div class="flex items-end">
            <p class="text-slate-600 dark:text-slate-400">
              The Wizard does not stand alone. It is one layer of the Volnux stack — connected to EventHub for components, the Volnux runtime for execution, and the Pointy-lang compiler for validation. Your visual workflow plugs into everything.
            </p>
          </div>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(card, i) in ecosystemCards"
            :key="card.title"
            class="reveal-item reveal-stagger-item group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/30 dark:hover:shadow-violet-500/5 opacity-0"
            :style="{ transitionDelay: `${i * 50}ms` }"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div class="absolute inset-x-0 top-0 h-0.5" :style="{ background: card.accent }" />
            <div class="relative">
              <div
                class="mb-4 flex h-10 w-10 items-center justify-center rounded-lg"
                :style="{ background: `${card.accent}15`, border: `1px solid ${card.accent}30`, color: card.accent }"
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5"><path :d="card.icon" /></svg>
              </div>
              <h4 class="mb-2 font-display text-base font-bold text-slate-900 dark:text-white">{{ card.title }}</h4>
              <p class="text-sm text-slate-600 dark:text-slate-400">{{ card.desc }}</p>
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
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.1),transparent_70%)]" />

      <div class="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div class="reveal-item">
          <span class="mb-6 block font-display text-5xl leading-none tracking-tight text-cyan-500/15 dark:text-cyan-400/10">→ → →</span>
          <h2 class="mb-4 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Open the canvas.<br />
            <span class="bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent dark:from-cyan-400 dark:to-violet-400">Ship your workflow.</span>
          </h2>
          <p class="mb-8 text-slate-600 dark:text-slate-400">
            The Wizard is available now in early access — free, in-browser, no installation required. Build your first governed workflow in under five minutes.
          </p>
          <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="/wizard" class="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-cyan-500/25 transition-all hover:shadow-cyan-500/40">
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M2 1.5l6.5 3.5L2 8.5V1.5z" fill="currentColor" /></svg>
              Open the wizard
              <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </a>
            <RouterLink to="/products/eventhub" class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/50 px-6 py-3 text-base font-medium text-slate-700 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:text-cyan-400">
              Browse EventHub →
            </RouterLink>
            <RouterLink to="/" class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/50 px-6 py-3 text-base font-medium text-slate-700 backdrop-blur-sm transition-all hover:border-cyan-500/50 hover:text-cyan-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:text-cyan-400">
              Volnux platform →
            </RouterLink>
          </div>
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

.wizard-preview:hover {
  transform: perspective(1200px) rotateY(0deg) rotateX(0deg) !important;
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

.tk-arr { color: #06b6d4; margin: 0 0.3rem; }
.tk-nd { color: #1e293b; }
.dark .tk-nd { color: #e2e8f0; }
.tk-op { color: #8b5cf6; margin: 0 0.3rem; }
.tk-meta { color: #10b981; }
.tk-ann { color: #f59e0b; }
.tk-rt { color: #fbbf24; margin-left: 0.3rem; }
.tk-str { color: #f472b6; }
.tk-txt { color: inherit; }

::selection {
  background: rgba(6, 182, 212, 0.3);
  color: white;
}
</style>
