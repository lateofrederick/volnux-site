<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()

const mainEl = ref<HTMLElement | null>(null)
const heroRef = ref<HTMLElement | null>(null)
const mouseX = ref(0)
const mouseY = ref(0)

const spotlightStyle = computed(() => {
  const color = isDark.value ? '245, 158, 11' : '217, 119, 6'
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

const sourceIndex = [
  { key: 'pypi', label: 'PyPI', accent: '#06b6d4', desc: 'Install any EventBase from the Python package index with semantic version pins.' },
  { key: 'git', label: 'Git', accent: '#8b5cf6', desc: 'Reference a branch, tag, or commit SHA from any Git repository — public or private.' },
  { key: 'hub', label: 'Hub', accent: '#f59e0b', desc: 'The community catalogue. Reviewed, curated, and discoverable by all teams.' },
  { key: 'local', label: 'Local', accent: '#10b981', desc: 'Packages on the machine. Fast iteration during development before you publish.' },
]

const accentMap: Record<string, { border: string; bg: string; text: string; badge: string; badgeBg: string; badgeText: string }> = {
  extract: { border: 'border-cyan-300 dark:border-cyan-500/30', bg: 'bg-cyan-50 dark:bg-cyan-500/5', text: 'text-cyan-700 dark:text-cyan-300', badge: 'bg-cyan-100 dark:bg-cyan-500/10', badgeBg: '', badgeText: 'text-cyan-700 dark:text-cyan-300' },
  transform: { border: 'border-violet-300 dark:border-violet-500/30', bg: 'bg-violet-50 dark:bg-violet-500/5', text: 'text-violet-700 dark:text-violet-300', badge: 'bg-violet-100 dark:bg-violet-500/10', badgeBg: '', badgeText: 'text-violet-700 dark:text-violet-300' },
  ai: { border: 'border-amber-300 dark:border-amber-500/30', bg: 'bg-amber-50 dark:bg-amber-500/5', text: 'text-amber-700 dark:text-amber-300', badge: 'bg-amber-100 dark:bg-amber-500/10', badgeBg: '', badgeText: 'text-amber-700 dark:text-amber-300' },
  validate: { border: 'border-emerald-300 dark:border-emerald-500/30', bg: 'bg-emerald-50 dark:bg-emerald-500/5', text: 'text-emerald-700 dark:text-emerald-300', badge: 'bg-emerald-100 dark:bg-emerald-500/10', badgeBg: '', badgeText: 'text-emerald-700 dark:text-emerald-300' },
  load: { border: 'border-pink-300 dark:border-pink-500/30', bg: 'bg-pink-50 dark:bg-pink-500/5', text: 'text-pink-700 dark:text-pink-300', badge: 'bg-pink-100 dark:bg-pink-500/10', badgeBg: '', badgeText: 'text-pink-700 dark:text-pink-300' },
  notify: { border: 'border-red-300 dark:border-red-500/30', bg: 'bg-red-50 dark:bg-red-500/5', text: 'text-red-700 dark:text-red-300', badge: 'bg-red-100 dark:bg-red-500/10', badgeBg: '', badgeText: 'text-red-700 dark:text-red-300' },
}

const eventPreview = [
  { name: 'RestApiExtract', source: 'pypi', version: 'v2.1.0', category: 'extract' },
  { name: 'GPT4Transform', source: 'hub', version: 'v1.4.2', category: 'ai' },
  { name: 'JsonValidate', source: 'pypi', version: 'v3.0.1', category: 'validate' },
  { name: 'SnowflakeLoad', source: 'pypi', version: 'v1.1.4', category: 'load' },
  { name: 'SlackNotify', source: 'hub', version: 'v2.0.0', category: 'notify' },
  { name: 'Normalise', source: 'git', version: 'v0.9.3', category: 'transform' },
]

const stats = [
  { value: '30+', label: 'Event types' },
  { value: '4', label: 'Source registries' },
  { value: '0', label: 'Shared repos needed' },
]

const howSteps = [
  { num: '01', title: 'Discover', desc: 'Search the registry by category, source, or keyword. Every event shows its version, checksum, and compatibility band.' },
  { num: '02', title: 'Reference', desc: 'Add the event to your Pointy-lang workflow with a source-prefixed pin — pypi:Extract@v2.1, hub:Notify@latest, git:Transform@main.' },
  { num: '03', title: 'Resolve', desc: 'The Volnux runtime pulls the implementation at execution time. No import step, no deployment step — just resolve and run.' },
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
      <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-amber-50/30 transition-colors duration-300 dark:from-[#0a0a0f] dark:via-[#12121a] dark:to-[#0f0f16]" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.08),transparent_50%)] transition-colors duration-300 dark:bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.12),transparent_50%)]" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(234,88,12,0.05),transparent_50%)] transition-colors duration-300 dark:bg-[radial-gradient(ellipse_at_bottom_left,rgba(234,88,12,0.08),transparent_50%)]" />

      <!-- Aurora blobs -->
      <div class="pointer-events-none absolute -left-32 -top-32 h-[600px] w-[600px] rounded-full transition-opacity duration-300" style="background: radial-gradient(circle, rgba(245,158,11,0.10) 0%, transparent 65%);" />
      <div class="pointer-events-none absolute bottom-0 right-[5%] h-[500px] w-[500px] rounded-full transition-opacity duration-300" style="background: radial-gradient(circle, rgba(234,88,12,0.08) 0%, transparent 65%);" />

      <!-- Mouse spotlight -->
      <div class="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300" :style="spotlightStyle" />

      <!-- Dot-grid pattern -->
      <div class="absolute inset-0 bg-[radial-gradient(rgba(0,0,0,0.06)_1px,transparent_1px)] bg-[size:24px_24px] dark:bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] dark:bg-[size:24px_24px]" />

      <div class="relative z-20 mx-auto w-full max-w-7xl">
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <!-- Left: Copy -->
          <div>
            <div class="reveal-item mb-6 inline-flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 dark:border-amber-500/30 dark:bg-amber-500/10">
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span class="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              <span class="text-sm font-medium text-amber-700 dark:text-amber-300">Volnux Event Registry</span>
            </div>

            <h1 class="reveal-item mb-6 font-display text-5xl font-bold leading-[1.1] tracking-tight text-slate-900 dark:text-white sm:text-6xl lg:text-7xl">
              Discover, publish, and<br />
              <span class="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 bg-clip-text text-transparent dark:from-amber-400 dark:via-orange-400 dark:to-red-400">resolve events.</span>
            </h1>

            <p class="reveal-item mb-8 text-lg leading-relaxed text-slate-600 dark:text-slate-400 sm:text-xl">
              EventHub is the registry where Pointy-lang workflows pull
              <span class="font-medium text-amber-600 dark:text-amber-400">EventBase</span> components from
              PyPI, Git, or the community hub — with pins, provenance, and compatibility signals so production runs stay reproducible.
            </p>

            <div class="reveal-item mb-10 flex flex-col gap-3 sm:flex-row">
              <RouterLink to="/products/eventhub/browse" class="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40">
                <span class="relative z-10">Browse registry</span>
                <svg class="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </RouterLink>
              <a href="/docs" class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/50 px-6 py-3 text-base font-medium text-slate-700 backdrop-blur-sm transition-all hover:border-amber-500/50 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:text-amber-400">
                Read the docs →
              </a>
            </div>

            <div class="reveal-item flex gap-8 border-t border-slate-200 pt-6 dark:border-slate-800">
              <div v-for="stat in stats" :key="stat.label">
                <div class="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{{ stat.value }}</div>
                <div class="text-sm text-slate-500 dark:text-slate-500">{{ stat.label }}</div>
              </div>
            </div>
          </div>

          <!-- Right: Source Index Sidebar -->
          <div class="reveal-item relative">
            <div class="absolute -inset-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 opacity-15 blur-xl transition-opacity duration-300 dark:opacity-20" />

            <div class="relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl transition-colors duration-300 dark:border-slate-800 dark:bg-[#0d0d12]">
              <div class="flex items-center gap-2 border-b border-slate-200 px-4 py-3 dark:border-slate-800">
                <div class="flex gap-1.5">
                  <div class="h-2.5 w-2.5 rounded-full bg-red-500/80" />
                  <div class="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                  <div class="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                </div>
                <span class="ml-3 text-xs text-slate-400 dark:text-slate-500">Source index</span>
              </div>

              <div class="p-4">
                <div class="mb-3 flex items-center gap-2">
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
                  <span class="font-mono text-xs text-slate-500 dark:text-slate-400">4 registries online</span>
                </div>
                <div class="space-y-2.5">
                  <div v-for="src in sourceIndex" :key="src.key" class="group flex items-start gap-3 rounded-lg border border-slate-100 bg-slate-50/50 p-3 transition-all hover:border-amber-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-amber-500/20">
                    <div class="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full" :style="{ background: src.accent }" />
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-display text-sm font-bold text-slate-900 dark:text-white">{{ src.label }}</span>
                        <span class="rounded border border-slate-200 bg-white px-1.5 py-0.5 font-mono text-[0.6rem] text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-500">{{ src.key }}:</span>
                      </div>
                      <p class="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">{{ src.desc }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="flex items-center gap-4 border-t border-slate-200 px-4 py-2 dark:border-slate-800">
                <span class="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  synced
                </span>
                <span class="text-xs text-slate-300 dark:text-slate-600">|</span>
                <span class="text-xs text-slate-500">latest: 2m ago</span>
                <span class="ml-auto text-xs text-amber-600 dark:text-amber-400">EventHub v1.0</span>
              </div>
            </div>

            <!-- Floating badge -->
            <div class="absolute -right-4 top-10 rounded-lg border border-slate-200 bg-white p-3 shadow-xl transition-colors duration-300 dark:border-slate-700 dark:bg-slate-900">
              <div class="flex items-center gap-2">
                <div class="flex h-8 w-8 items-center justify-center rounded bg-gradient-to-br from-amber-500 to-orange-600 text-xs font-bold text-white">EH</div>
                <div class="text-xs">
                  <div class="font-medium text-slate-900 dark:text-white">Registry</div>
                  <div class="text-slate-500">Online</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         EVENT REGISTRY PREVIEW
         ============================================ -->
    <section id="registry" class="relative border-y border-slate-200 bg-slate-50/50 py-16 transition-colors duration-300 dark:border-slate-800/50 dark:bg-[#0c0c10]">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal-item mb-10 text-center">
          <span class="mb-2 text-xs font-semibold uppercase tracking-widest text-amber-600 dark:text-amber-400">Registry Preview</span>
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Every event, <span class="text-amber-600 dark:text-amber-400">one catalogue.</span>
          </h2>
          <p class="mx-auto mt-3 max-w-xl text-slate-600 dark:text-slate-400">
            Browse EventBase components by category — each one versioned, sourced, and ready for your Pointy-lang workflow.
          </p>
        </div>

        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(evt, i) in eventPreview"
            :key="evt.name"
            class="reveal-item reveal-stagger-item group relative overflow-hidden rounded-lg border bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg opacity-0"
            :class="[accentMap[evt.category]?.border || 'border-slate-200 dark:border-slate-800', accentMap[evt.category]?.bg || 'bg-white dark:bg-slate-900/30']"
            :style="{ transitionDelay: `${i * 60}ms` }"
          >
            <div class="absolute inset-x-0 top-0 h-0.5 transition-all duration-300" :style="{ background: sourceIndex.find(s => s.key === evt.source)?.accent || '#f59e0b' }" />
            <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div class="relative">
              <div class="mb-3 flex items-center justify-between">
                <span class="font-display text-base font-bold text-slate-900 dark:text-white">{{ evt.name }}</span>
                <span class="rounded border border-slate-200 bg-white px-2 py-0.5 font-mono text-[0.65rem] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">{{ evt.version }}</span>
              </div>
              <div class="flex items-center gap-2">
                <div class="h-2 w-2 rounded-full" :style="{ background: sourceIndex.find(s => s.key === evt.source)?.accent || '#f59e0b' }" />
                <span class="font-mono text-xs uppercase tracking-wider" :class="accentMap[evt.category]?.text || 'text-slate-600 dark:text-slate-400'">{{ evt.source }}:{{ evt.name }}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="reveal-item mt-8 text-center">
          <RouterLink to="/products/eventhub/browse" class="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white/50 px-5 py-2.5 text-sm font-medium text-slate-700 backdrop-blur-sm transition-all hover:border-amber-500/50 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:text-amber-400">
            Browse full registry →
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- ============================================
         HOW IT WORKS
         ============================================ -->
    <section id="how" class="relative py-16 transition-colors duration-300 dark:bg-[#0a0a0f]">
      <div class="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 opacity-50 transition-opacity duration-300 dark:from-[#0c0c10] dark:via-[#0a0a0f] dark:to-[#0c0c10] dark:opacity-100" />

      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal-item mb-12 text-center">
          <span class="mb-2 text-xs font-semibold uppercase tracking-widest text-orange-600 dark:text-orange-400">How it works</span>
          <h2 class="text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Three steps to<br />
            <span class="bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent dark:from-amber-400 dark:to-orange-400">versioned events.</span>
          </h2>
        </div>

        <div class="relative grid gap-6 md:grid-cols-3">
          <!-- Connecting line -->
          <div class="pointer-events-none absolute top-10 left-[16.67%] right-[16.67%] hidden h-px bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-red-500/30 md:block" />

          <div
            v-for="(step, i) in howSteps"
            :key="step.num"
            class="reveal-item reveal-stagger-item group relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 text-center transition-all duration-500 hover:-translate-y-1 hover:border-amber-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-amber-500/30 dark:hover:shadow-amber-500/10 opacity-0"
            :style="{ transitionDelay: `${i * 100}ms` }"
          >
            <div class="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div class="relative">
              <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 font-display text-lg font-extrabold text-white shadow-lg shadow-amber-500/25">{{ step.num }}</div>
              <h3 class="mb-2 font-display text-lg font-bold text-slate-900 dark:text-white">{{ step.title }}</h3>
              <p class="text-sm text-slate-600 dark:text-slate-400">{{ step.desc }}</p>
              <div class="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-900 p-3 dark:border-slate-800 dark:bg-[#0a0a0f]">
                <pre v-if="i === 0" class="font-mono text-xs leading-relaxed text-slate-400"><span class="text-amber-400">$</span> eventhub search --category extract</pre>
                <pre v-else-if="i === 1" class="font-mono text-xs leading-relaxed text-slate-400"><span class="text-cyan-400">pypi</span><span class="text-slate-500">:</span><span class="text-amber-300">Extract</span><span class="text-slate-500">@</span><span class="text-emerald-400">v2.1</span></pre>
                <pre v-else class="font-mono text-xs leading-relaxed text-slate-400"><span class="text-violet-400">-></span> <span class="text-amber-300">resolve</span> <span class="text-emerald-400">✓</span> installed</pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         PUBLISH SECTION
         ============================================ -->
    <section id="publish" class="relative border-y border-slate-200 bg-slate-50/50 py-16 transition-colors duration-300 dark:border-slate-800/50 dark:bg-[#0c0c10]">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="reveal-item grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <!-- Left: Copy -->
          <div>
            <span class="mb-2 text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Publish</span>
            <h2 class="mb-4 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Ship immutable references your teams <span class="text-emerald-600 dark:text-emerald-400">can trust.</span>
            </h2>
            <p class="mb-6 text-slate-600 dark:text-slate-400">
              Publish your EventBase classes to any registry with semantic versions, checksums, and clear compatibility bands. Downstream workflows pin to the exact version they tested — and the runtime resolves it at execution time.
            </p>
            <ul class="space-y-3">
              <li class="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                <span>Semantic version pins — <code class="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-700 dark:bg-slate-800 dark:text-slate-300">@v2.1.0</code></span>
              </li>
              <li class="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                <span>SHA-256 checksums for every artifact</span>
              </li>
              <li class="flex items-start gap-3 text-slate-700 dark:text-slate-300">
                <svg class="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>
                <span>Compatibility bands — declare what you support</span>
              </li>
            </ul>
          </div>

          <!-- Right: Code blocks -->
          <div class="relative">
            <div class="absolute -inset-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-emerald-500/20 blur-xl" />
            <div class="relative space-y-4">
              <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div class="flex items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
                  <div class="flex gap-1.5">
                    <div class="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                    <div class="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                    <div class="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                  </div>
                  <span class="ml-2 text-xs text-slate-400 dark:text-slate-600">publish.sh</span>
                </div>
                <div class="p-4">
                  <pre class="font-mono text-sm leading-relaxed text-slate-600 dark:text-slate-400"><span class="text-amber-600 dark:text-amber-400">$</span> eventhub publish \
  <span class="text-emerald-600 dark:text-emerald-400">--source</span> pypi \
  <span class="text-emerald-600 dark:text-emerald-400">--name</span> <span class="text-cyan-600 dark:text-cyan-300">RestApiExtract</span> \
  <span class="text-emerald-600 dark:text-emerald-400">--version</span> <span class="text-violet-600 dark:text-violet-400">2.1.0</span> \
  <span class="text-emerald-600 dark:text-emerald-400">--compat</span> <span class="text-orange-600 dark:text-orange-400">^2.0</span></pre>
                </div>
              </div>

              <div class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900">
                <div class="flex items-center gap-2 border-b border-slate-200 px-4 py-2 dark:border-slate-800">
                  <div class="flex gap-1.5">
                    <div class="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                    <div class="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                    <div class="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                  </div>
                  <span class="ml-2 text-xs text-slate-400 dark:text-slate-600">workflow.pointy</span>
                </div>
                <div class="p-4">
                  <pre class="font-mono text-sm leading-relaxed text-slate-600 dark:text-slate-400"><span class="text-cyan-600 dark:text-cyan-300">pypi</span><span class="text-slate-400">:</span><span class="text-amber-600 dark:text-amber-300">RestApiExtract</span><span class="text-slate-400">@</span><span class="text-violet-600 dark:text-violet-400">v2.1.0</span>
  <span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-amber-600 dark:text-amber-300">ClassifyIntent</span>
  <span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-amber-600 dark:text-amber-300">Process</span><span class="text-slate-400">(</span>
    <span class="text-emerald-600 dark:text-emerald-300">success</span> <span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-amber-600 dark:text-amber-300">SnowflakeLoad</span>,
    <span class="text-rose-600 dark:text-rose-300">failure</span> <span class="text-violet-600 dark:text-violet-400">-></span> <span class="text-amber-600 dark:text-amber-300">Quarantine</span>
  <span class="text-slate-400">)</span></pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         CTA SECTION
         ============================================ -->
    <section class="relative py-16 transition-colors duration-300 dark:bg-[#0a0a0f]">
      <div class="absolute inset-0 bg-gradient-to-b from-slate-50 via-white to-slate-50 opacity-50 transition-opacity duration-300 dark:from-[#0c0c10] dark:via-[#0a0a0f] dark:to-[#0c0c10] dark:opacity-100" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.06),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(245,158,11,0.1),transparent_70%)]" />

      <div class="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div class="reveal-item">
          <span class="mb-6 block font-display text-5xl leading-none tracking-tight text-amber-500/15 dark:text-amber-400/10">→ → →</span>
          <h2 class="mb-4 font-display text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Ready when you are.
          </h2>
          <p class="mb-8 text-slate-600 dark:text-slate-400">
            Open the preview registry, or jump back to the platform for the full Volnux story.
          </p>
          <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <RouterLink to="/products/eventhub/browse" class="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-amber-500/25 transition-all hover:shadow-amber-500/40">
              Browse the registry
              <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </RouterLink>
            <RouterLink to="/" class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white/50 px-6 py-3 text-base font-medium text-slate-700 backdrop-blur-sm transition-all hover:border-amber-500/50 hover:text-amber-600 dark:border-slate-700 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:text-amber-400">
              Volnux home →
            </RouterLink>
          </div>

          <p class="mt-6 font-mono text-xs text-slate-400 dark:text-slate-600">
            The live event catalogue and detail pages are in development — the preview registry remains available from this build.
          </p>
        </div>
      </div>
    </section>
  </main>
</template>

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

::selection {
  background: rgba(245, 158, 11, 0.3);
  color: white;
}
</style>
