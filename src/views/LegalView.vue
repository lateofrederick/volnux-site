<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()

const mainEl = ref<HTMLElement | null>(null)
const heroRef = ref<HTMLElement | null>(null)
const activeTab = ref<'privacy' | 'terms'>('privacy')
const tabIndicatorRef = ref<HTMLElement | null>(null)
const privacyTabRef = ref<HTMLElement | null>(null)
const termsTabRef = ref<HTMLElement | null>(null)

// ============================================
// MOUSE SPOTLIGHT
// ============================================
const mouseX = ref(0)
const mouseY = ref(0)

const spotlightStyle = computed(() => {
  const color = isDark.value ? '99, 102, 241' : '67, 56, 202'
  const opacity = isDark.value ? '0.14' : '0.18'
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

// ============================================
// TAB INDICATOR
// ============================================
const tabIndicatorStyle = computed(() => {
  const activeRef = activeTab.value === 'privacy' ? privacyTabRef.value : termsTabRef.value
  if (!activeRef) return { left: '0px', width: '0px' }
  return {
    left: `${activeRef.offsetLeft}px`,
    width: `${activeRef.offsetWidth}px`,
  }
})

// ============================================
// TOC DATA
// ============================================
const TOC_DATA: Record<string, { id: string; label: string }[]> = {
  privacy: [
    { id: 'priv-1', label: 'Who we are' },
    { id: 'priv-2', label: 'What data we collect' },
    { id: 'priv-3', label: 'Legal basis' },
    { id: 'priv-4', label: 'How we use data' },
    { id: 'priv-5', label: 'Data sharing' },
    { id: 'priv-6', label: 'Your rights' },
    { id: 'priv-7', label: 'Cookies' },
    { id: 'priv-8', label: 'International transfers' },
    { id: 'priv-9', label: 'Security' },
    { id: 'priv-10', label: 'Changes' },
  ],
  terms: [
    { id: 'terms-1', label: 'Acceptance of terms' },
    { id: 'terms-2', label: 'Definitions' },
    { id: 'terms-3', label: 'Your account' },
    { id: 'terms-4', label: 'Acceptable use' },
    { id: 'terms-5', label: 'Intellectual property' },
    { id: 'terms-6', label: 'Subscriptions' },
    { id: 'terms-7', label: 'Service levels' },
    { id: 'terms-8', label: 'Confidentiality' },
    { id: 'terms-9', label: 'Liability' },
    { id: 'terms-10', label: 'Termination' },
    { id: 'terms-11', label: 'EventHub obligations' },
    { id: 'terms-12', label: 'Governing law' },
    { id: 'terms-13', label: 'Changes' },
  ],
}

const currentToc = computed(() => TOC_DATA[activeTab.value])

const activeTocId = ref('')

function switchTab(tab: 'privacy' | 'terms') {
  activeTab.value = tab
  scrollToTabArea()
}

function scrollToAnchor(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function scrollToTabArea() {
  const tabsEl = document.getElementById('doc-tabs')
  if (tabsEl) window.scrollTo({ top: tabsEl.offsetTop - 10, behavior: 'smooth' })
}

// ============================================
// INTERSECTION OBSERVERS
// ============================================
let revealObserver: IntersectionObserver | null = null
let scrollSpyObserver: IntersectionObserver | null = null

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
    { threshold: 0.06 },
  )
  el.querySelectorAll('.reveal-item').forEach((node) => revealObserver?.observe(node))

  scrollSpyObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeTocId.value = entry.target.id
        }
      })
    },
    { rootMargin: '-20% 0px -70% 0px' },
  )
  el.querySelectorAll('.doc-section[id]').forEach((s) => scrollSpyObserver?.observe(s))
})

onUnmounted(() => {
  revealObserver?.disconnect()
  scrollSpyObserver?.disconnect()
})

// ============================================
// TABLE DATA
// ============================================
const dataCategories = [
  { category: 'Account identity', elements: 'Name, email address, organisation name, profile photo (optional)', purpose: 'Authentication, account management, communications', retention: 'Duration of account + 90 days post-deletion' },
  { category: 'Authentication credentials', elements: 'Hashed passwords, SSO tokens, session identifiers', purpose: 'Secure login and session management', retention: 'Duration of session; passwords until changed' },
  { category: 'Billing data', elements: 'Payment method tokens (via Stripe), billing address, invoice history', purpose: 'Subscription processing; fraud prevention', retention: '7 years (statutory requirement)' },
  { category: 'Usage telemetry', elements: 'Feature interactions, API call counts, error rates (anonymised)', purpose: 'Product improvement; capacity planning', retention: '24 months rolling, then aggregated' },
  { category: 'Workflow content', elements: 'Pointy-lang definitions, execution results, checkpoint data, OTEL traces', purpose: 'Workflow execution and governance', retention: 'Duration of subscription + 30 days' },
  { category: 'Support communications', elements: 'Email content, ticket descriptions, attachments', purpose: 'Support resolution; quality improvement', retention: '3 years from ticket closure' },
  { category: 'Security logs', elements: 'IP addresses, login events, access patterns, audit log entries', purpose: 'Security monitoring; incident response', retention: '12 months rolling' },
]

const subProcessors = [
  { name: 'AWS / GCP', purpose: 'Cloud infrastructure, storage, and compute for the execution mesh', location: 'EU, US (configurable by organisation)' },
  { name: 'Stripe', purpose: 'Payment processing and subscription management', location: 'United States' },
  { name: 'PostHog', purpose: 'Self-hosted product analytics (anonymised)', location: 'EU (self-hosted on our infrastructure)' },
  { name: 'Resend', purpose: 'Transactional email delivery', location: 'United States' },
  { name: 'Sentry', purpose: 'Error monitoring and crash reporting', location: 'United States' },
]

const cookieData = [
  { name: 'session_id', purpose: 'Maintains your authenticated session', duration: 'Session', type: 'Strictly necessary' },
  { name: 'csrf_token', purpose: 'Prevents cross-site request forgery', duration: 'Session', type: 'Strictly necessary' },
  { name: 'theme_pref', purpose: 'Remembers your UI theme preference', duration: '1 year', type: 'Functional' },
  { name: 'posthog_anon', purpose: 'Anonymised product analytics (no PII)', duration: '1 year', type: 'Analytics (opt-out available)' },
]

// ============================================
// READING PROGRESS
// ============================================
const readingProgress = computed(() => {
  const items = currentToc.value
  const idx = items.findIndex((item) => item.id === activeTocId.value)
  if (idx < 0) return 0
  return ((idx + 1) / items.length) * 100
})
</script>

<template>
  <main ref="mainEl" class="relative z-10 overflow-x-hidden bg-white transition-colors duration-300 dark:bg-vn-black">

    <!-- ═══ HERO ═══ -->
    <section
      ref="heroRef"
      @mousemove="handleMouseMove"
      class="relative flex min-h-[70vh] flex-col justify-center overflow-hidden border-b border-slate-200 transition-colors duration-300 dark:border-vn-border sm:min-h-[60vh]"
    >
      <!-- Gradient background layers -->
      <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 transition-colors duration-300 dark:from-vn-black dark:via-vn-surface2 dark:to-[#0f0f16]" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.08),transparent_50%)] transition-colors duration-300 dark:bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_50%)]" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.06),transparent_50%)] transition-colors duration-300 dark:bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.1),transparent_50%)]" />
      <!-- Mouse spotlight -->
      <div class="pointer-events-none absolute inset-0 z-10" :style="spotlightStyle" />
      <!-- Grid pattern -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:60px_60px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />

      <!-- Decorative watermark -->
      <div class="pointer-events-none absolute bottom-0 right-0 select-none font-display text-[7rem] font-bold italic leading-none tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(99,102,241,0.06)] sm:text-[10rem] lg:text-[14rem] dark:[-webkit-text-stroke:1px_rgba(99,102,241,0.04)]">
        Legal
      </div>

      <div class="vn-container relative z-20 py-28 sm:py-36">
        <div class="max-w-3xl">
          <!-- Tag -->
          <div class="reveal-item mb-8 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-50/80 px-3 py-1.5 backdrop-blur-sm opacity-0 translate-y-6 transition-all duration-700 dark:border-indigo-500/30 dark:bg-indigo-500/10">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75 dark:bg-vn-accent" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-indigo-500 dark:bg-vn-accent" />
            </span>
            <span class="text-sm font-medium text-indigo-700 dark:text-indigo-300">Volnux — Legal Documents</span>
          </div>

          <!-- Headline -->
          <h1 class="reveal-item font-display text-5xl font-bold leading-[0.88] tracking-tight text-slate-900 opacity-0 translate-y-6 transition-all duration-700 dark:text-vn-white sm:text-6xl md:text-7xl lg:text-[5.5rem]">
            Privacy &amp; <span class="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-fuchsia-400">Terms</span><br>
            of Service
          </h1>

          <!-- Meta pills -->
          <div class="reveal-item mt-10 flex flex-wrap gap-3 opacity-0 translate-y-6 transition-all duration-700 sm:gap-4 [transition-delay:150ms]">
            <div v-for="m in [
              { label: 'Version', value: '1.0.0' },
              { label: 'Effective', value: '1 Jan 2025' },
              { label: 'Updated', value: '28 Apr 2026' },
              { label: 'Jurisdiction', value: 'Ghana / Int\'l' },
            ]" :key="m.label" class="reveal-stagger-item group flex items-center gap-2.5 rounded-lg border border-slate-200 bg-white/80 px-3.5 py-2 backdrop-blur-sm transition-all duration-300 hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900/50 dark:hover:border-indigo-500/30">
              <span class="font-mono text-2xs uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">{{ m.label }}</span>
              <span class="h-3 w-px bg-slate-200 dark:bg-slate-700" />
              <span class="font-mono text-xs font-medium text-indigo-600 dark:text-indigo-400">{{ m.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══ TABS ═══ -->
    <div id="doc-tabs" class="sticky top-16 z-[100] border-b border-slate-200 bg-white/80 backdrop-blur-md transition-colors duration-300 dark:border-vn-border dark:bg-vn-black/80">
      <!-- Reading progress bar -->
      <div class="h-[2px] bg-slate-100 dark:bg-vn-surface">
        <div
          class="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 ease-out dark:from-vn-accent dark:to-vn-accent2"
          :style="{ width: `${readingProgress}%` }"
        />
      </div>

      <div class="vn-container relative flex items-stretch">
        <!-- Sliding indicator -->
        <div
          ref="tabIndicatorRef"
          class="absolute bottom-0 h-[3px] bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 ease-out dark:from-vn-accent dark:to-vn-accent2"
          :style="tabIndicatorStyle"
        />

        <button
          ref="privacyTabRef"
          class="relative flex items-center gap-2.5 px-6 py-4 font-mono text-sm font-medium transition-colors sm:px-8"
          :class="activeTab === 'privacy'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'"
          @click="switchTab('privacy')"
        >
          <span class="hidden text-2xs opacity-60 sm:inline">01 /</span>
          Privacy Policy
        </button>

        <div class="my-3 w-px bg-slate-200 dark:bg-vn-border" />

        <button
          ref="termsTabRef"
          class="relative flex items-center gap-2.5 px-6 py-4 font-mono text-sm font-medium transition-colors sm:px-8"
          :class="activeTab === 'terms'
            ? 'text-indigo-600 dark:text-indigo-400'
            : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'"
          @click="switchTab('terms')"
        >
          <span class="hidden text-2xs opacity-60 sm:inline">02 /</span>
          Terms of Service
        </button>

        <div class="flex-1" />
        <span class="hidden items-center font-mono text-2xs uppercase tracking-wider text-slate-400 sm:flex dark:text-slate-500">
          Updated 28 Apr 2026
        </span>
      </div>
    </div>

    <!-- ═══ MAIN LAYOUT ═══ -->
    <div class="vn-container grid max-w-7xl grid-cols-1 gap-8 py-0 lg:grid-cols-[220px_1fr] lg:gap-16">

      <!-- ── Sidebar ToC ── -->
      <aside class="hidden lg:sticky lg:top-28 lg:block lg:self-start lg:py-8">
        <div class="mb-4 flex items-center gap-2">
          <span class="h-px flex-1 bg-gradient-to-r from-indigo-500/40 to-transparent dark:from-vn-accent/40" />
          <span class="font-mono text-2xs uppercase tracking-[0.16em] text-indigo-600 dark:text-indigo-400">Contents</span>
        </div>

        <ul class="flex flex-col">
          <li
            v-for="item in currentToc"
            :key="item.id"
            class="relative border-l-2 transition-all duration-300"
            :class="activeTocId === item.id
              ? 'border-indigo-500 dark:border-vn-accent'
              : 'border-slate-200 dark:border-vn-border'"
          >
            <button
              class="block w-full px-3.5 py-2 text-left font-mono text-xs leading-relaxed transition-all duration-300"
              :class="activeTocId === item.id
                ? 'font-medium text-indigo-600 dark:text-indigo-400'
                : 'text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-300'"
              @click="scrollToAnchor(item.id)"
            >
              {{ item.label }}
            </button>
            <!-- Active glow dot -->
            <span
              v-if="activeTocId === item.id"
              class="absolute -left-[5px] top-2.5 h-2 w-2 rounded-full bg-indigo-500 shadow-lg shadow-indigo-500/50 dark:bg-vn-accent dark:shadow-vn-accent/30"
            />
          </li>
        </ul>
      </aside>

      <!-- ── Content ── -->
      <div class="pb-16 pt-6 lg:pt-8">

        <!-- ════════════════════════════════
             PRIVACY POLICY
        ════════════════════════════════ -->
        <div v-show="activeTab === 'privacy'" class="space-y-0">

          <!-- Summary -->
          <div class="reveal-item mb-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80 opacity-0 translate-y-6 transition-all duration-700 dark:border-slate-800 dark:bg-vn-surface/30 sm:p-7">
            <div class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 dark:from-vn-accent dark:via-vn-accent2 dark:to-vn-accent3" style="position: relative;" />
            <div class="flex items-center gap-2 p-6 pb-0 sm:p-7 sm:pb-0">
              <span class="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-xs dark:bg-indigo-500/20">
                <svg class="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              <p class="font-mono text-2xs uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">Plain-language summary</p>
            </div>
            <p class="p-6 pt-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300 sm:p-7 sm:pt-3 sm:text-lg">
              Volnux collects the minimum data necessary to operate our platform. We do not sell your personal data. We do not display advertising. Your workflow definitions, execution traces, and component code are yours. You can request deletion of your data at any time.
            </p>
          </div>

          <!-- §01 -->
          <div id="priv-1" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">01</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Who we are and how to contact us</h2>
            </div>
            <p class="mb-4 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              Volnux is a software company that builds workflow orchestration infrastructure, including the Volnux Platform, Pointy-lang, EventHub registry, and associated developer tooling. Our registered address and data controller contact are:
            </p>

            <div class="space-y-3">
              <div class="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-indigo-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-indigo-500/20">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 transition-colors group-hover:bg-indigo-200 dark:bg-indigo-500/15 dark:group-hover:bg-indigo-500/25">
                  <svg class="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 18 18"><rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M2 6l7 5 7-5" stroke="currentColor" stroke-width="1.4"/></svg>
                </div>
                <div>
                  <p class="font-mono text-2xs uppercase tracking-wider text-slate-400 dark:text-slate-500">Data Controller</p>
                  <p class="font-mono text-sm font-medium text-indigo-600 dark:text-indigo-400">privacy@volnux.dev</p>
                </div>
              </div>
              <div class="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-indigo-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-indigo-500/20">
                <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 transition-colors group-hover:bg-indigo-200 dark:bg-indigo-500/15 dark:group-hover:bg-indigo-500/25">
                  <svg class="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 18 18"><path d="M9 2C6.2 2 4 4.2 4 7c0 4 5 9 5 9s5-5 5-9c0-2.8-2.2-5-5-5z" stroke="currentColor" stroke-width="1.4"/><circle cx="9" cy="7" r="1.5" stroke="currentColor" stroke-width="1.4"/></svg>
                </div>
                <div>
                  <p class="font-mono text-2xs uppercase tracking-wider text-slate-400 dark:text-slate-500">Registered address</p>
                  <p class="font-mono text-sm font-medium text-indigo-600 dark:text-indigo-400">Accra, Greater Accra Region, Ghana</p>
                </div>
              </div>
            </div>
          </div>

          <!-- §02 -->
          <div id="priv-2" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">02</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">What data we collect</h2>
            </div>
            <p class="mb-4 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              We collect only the data required to provide, operate, and improve our services. The following table describes each category of personal data we process.
            </p>

            <div class="-mx-4 overflow-x-auto rounded-xl border border-slate-200 sm:mx-0 dark:border-slate-800">
              <table class="w-full border-collapse text-sm">
                <thead>
                  <tr class="bg-gradient-to-r from-indigo-50/60 to-violet-50/40 dark:from-vn-surface/80 dark:to-vn-surface2/40">
                    <th class="whitespace-nowrap border-b border-slate-200 px-3 py-2.5 text-left font-mono text-2xs uppercase tracking-wider text-indigo-600/60 dark:border-slate-800 dark:text-indigo-400/50">Category</th>
                    <th class="border-b border-slate-200 px-3 py-2.5 text-left font-mono text-2xs uppercase tracking-wider text-indigo-600/60 dark:border-slate-800 dark:text-indigo-400/50">Data elements</th>
                    <th class="border-b border-slate-200 px-3 py-2.5 text-left font-mono text-2xs uppercase tracking-wider text-indigo-600/60 dark:border-slate-800 dark:text-indigo-400/50">Purpose</th>
                    <th class="whitespace-nowrap border-b border-slate-200 px-3 py-2.5 text-left font-mono text-2xs uppercase tracking-wider text-indigo-600/60 dark:border-slate-800 dark:text-indigo-400/50">Retention</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in dataCategories" :key="row.category" class="border-b border-slate-100 transition-colors hover:bg-indigo-50/30 dark:border-slate-800/60 dark:hover:bg-vn-surface/30">
                    <td class="whitespace-nowrap px-3 py-3 font-mono text-xs font-medium text-slate-900 dark:text-vn-white">{{ row.category }}</td>
                    <td class="px-3 py-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">{{ row.elements }}</td>
                    <td class="px-3 py-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">{{ row.purpose }}</td>
                    <td class="whitespace-nowrap px-3 py-3 text-xs text-slate-700 dark:text-slate-300">{{ row.retention }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 class="mt-8 border-b border-slate-200 pb-2 font-mono text-xs font-medium uppercase tracking-wider text-slate-900 dark:border-slate-800 dark:text-vn-white">Data we do not collect</h3>
            <ul class="mt-3 space-y-0">
              <li class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                We do not collect data from children under 13. Our services are not directed at children.
              </li>
              <li class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                We do not collect racial or ethnic origin, political opinions, health data, or biometric data.
              </li>
              <li class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                We do not track you across third-party websites. We have no advertising trackers.
              </li>
              <li class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                We do not read the content of your Pointy-lang workflows for any purpose other than execution and displaying them to you.
              </li>
            </ul>
          </div>

          <!-- §03 -->
          <div id="priv-3" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">03</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Legal basis for processing</h2>
            </div>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              Where data protection law requires us to identify a legal basis for processing personal data, we rely on the following:
            </p>
            <ul class="space-y-0">
              <li class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                <strong class="font-medium text-slate-900 dark:text-vn-white">Contract performance:</strong> processing necessary to provide the Volnux Platform services you have subscribed to, including running workflows, managing your account, and processing billing.
              </li>
              <li class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                <strong class="font-medium text-slate-900 dark:text-vn-white">Legitimate interests:</strong> security monitoring, fraud prevention, product analytics, and improving our services — where our interests do not override your privacy rights.
              </li>
              <li class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                <strong class="font-medium text-slate-900 dark:text-vn-white">Legal obligation:</strong> retaining billing records and responding to lawful regulatory requests.
              </li>
              <li class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                <strong class="font-medium text-slate-900 dark:text-vn-white">Consent:</strong> marketing emails and optional feature research programmes. You may withdraw consent at any time.
              </li>
            </ul>
          </div>

          <!-- §04 -->
          <div id="priv-4" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">04</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">How we use your data</h2>
            </div>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              We use personal data strictly for the purposes stated at collection. The primary uses are:
            </p>
            <ul class="space-y-0">
              <li v-for="item in [
                'Providing, maintaining, and improving the Volnux Platform and related products',
                'Processing your subscription and managing billing',
                'Sending transactional communications — account confirmations, security alerts, billing notifications',
                'Responding to support requests and communicating about your account',
                'Detecting and preventing fraud, abuse, and security incidents',
                'Complying with legal obligations and responding to lawful government requests',
                'Conducting anonymised product analytics to improve the platform',
              ]" :key="item" class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                {{ item }}
              </li>
            </ul>
            <!-- Warning callout -->
            <div class="mt-4 overflow-hidden rounded-xl border border-rose-200/60 bg-rose-50/50 p-4 dark:border-rose-500/20 dark:bg-rose-500/5 sm:p-5">
              <div class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-rose-500 to-orange-500" style="position: relative;" />
              <div class="flex items-start gap-3">
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-rose-100 dark:bg-rose-500/20">
                  <svg class="h-3 w-3 text-rose-600 dark:text-rose-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                </span>
                <div>
                  <p class="mb-1 font-mono text-2xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Important</p>
                  <p class="text-sm leading-[1.75] text-slate-700 dark:text-slate-300">
                    We do not sell your personal data to third parties. We do not share your workflow definitions, execution traces, or EventHub components with any third party except as required to operate the platform (e.g. cloud infrastructure providers under data processing agreements) or as required by law.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- §05 -->
          <div id="priv-5" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">05</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Data sharing and sub-processors</h2>
            </div>
            <p class="mb-4 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              To provide our services we engage trusted third-party sub-processors. Each sub-processor is bound by a data processing agreement consistent with applicable data protection law.
            </p>

            <div class="-mx-4 overflow-x-auto rounded-xl border border-slate-200 sm:mx-0 dark:border-slate-800">
              <table class="w-full border-collapse text-sm">
                <thead>
                  <tr class="bg-gradient-to-r from-indigo-50/60 to-violet-50/40 dark:from-vn-surface/80 dark:to-vn-surface2/40">
                    <th class="border-b border-slate-200 px-3 py-2.5 text-left font-mono text-2xs uppercase tracking-wider text-indigo-600/60 dark:border-slate-800 dark:text-indigo-400/50">Sub-processor</th>
                    <th class="border-b border-slate-200 px-3 py-2.5 text-left font-mono text-2xs uppercase tracking-wider text-indigo-600/60 dark:border-slate-800 dark:text-indigo-400/50">Purpose</th>
                    <th class="border-b border-slate-200 px-3 py-2.5 text-left font-mono text-2xs uppercase tracking-wider text-indigo-600/60 dark:border-slate-800 dark:text-indigo-400/50">Location</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in subProcessors" :key="row.name" class="border-b border-slate-100 transition-colors hover:bg-indigo-50/30 dark:border-slate-800/60 dark:hover:bg-vn-surface/30">
                    <td class="px-3 py-3 font-mono text-xs font-medium text-slate-900 dark:text-vn-white">{{ row.name }}</td>
                    <td class="px-3 py-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">{{ row.purpose }}</td>
                    <td class="px-3 py-3 text-xs text-slate-700 dark:text-slate-300">{{ row.location }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p class="mt-4 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              We do not share personal data with any other third parties except where required by applicable law, court order, or a government authority with lawful jurisdiction.
            </p>
          </div>

          <!-- §06 -->
          <div id="priv-6" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">06</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Your rights</h2>
            </div>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              Depending on your location you may have the following rights with respect to your personal data. To exercise any of these rights, contact us at <strong class="font-medium text-indigo-600 dark:text-indigo-400">privacy@volnux.dev</strong>. We will respond within 30 days.
            </p>
            <ul class="space-y-0">
              <li v-for="item in [
                { bold: 'Access', text: 'request a copy of the personal data we hold about you' },
                { bold: 'Rectification', text: 'request correction of inaccurate or incomplete data' },
                { bold: 'Erasure', text: 'request deletion of your personal data where we have no overriding legal obligation to retain it' },
                { bold: 'Restriction', text: 'request that we restrict processing of your data in certain circumstances' },
                { bold: 'Portability', text: 'receive your personal data in a structured, machine-readable format' },
                { bold: 'Objection', text: 'object to processing based on legitimate interests' },
                { bold: 'Withdraw consent', text: 'where processing is based on consent, withdraw it at any time without affecting the lawfulness of prior processing' },
                { bold: 'Lodge a complaint', text: 'file a complaint with your national data protection authority' },
              ]" :key="item.bold" class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                <strong class="font-medium text-slate-900 dark:text-vn-white">{{ item.bold }}:</strong> {{ item.text }}
              </li>
            </ul>
            <!-- Info callout -->
            <div class="mt-4 overflow-hidden rounded-xl border border-cyan-200/60 bg-cyan-50/50 p-4 dark:border-cyan-500/20 dark:bg-cyan-500/5 sm:p-5">
              <div class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-cyan-500 to-blue-500" style="position: relative;" />
              <div class="flex items-start gap-3">
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-cyan-100 dark:bg-cyan-500/20">
                  <svg class="h-3 w-3 text-cyan-700 dark:text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                <p class="text-sm leading-[1.75] text-slate-700 dark:text-slate-300">
                  Deleting your account triggers an automated data deletion process. Your personal data is removed within 30 days. Workflow content is removed within 30 days. Billing records are retained for 7 years as required by law. Anonymised aggregate analytics are retained indefinitely.
                </p>
              </div>
            </div>
          </div>

          <!-- §07 -->
          <div id="priv-7" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">07</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Cookies and tracking technologies</h2>
            </div>
            <p class="mb-4 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              We use a minimal set of cookies necessary to operate the platform. We do not use advertising cookies, cross-site tracking, or third-party analytics cookies.
            </p>

            <div class="-mx-4 overflow-x-auto rounded-xl border border-slate-200 sm:mx-0 dark:border-slate-800">
              <table class="w-full border-collapse text-sm">
                <thead>
                  <tr class="bg-gradient-to-r from-indigo-50/60 to-violet-50/40 dark:from-vn-surface/80 dark:to-vn-surface2/40">
                    <th class="border-b border-slate-200 px-3 py-2.5 text-left font-mono text-2xs uppercase tracking-wider text-indigo-600/60 dark:border-slate-800 dark:text-indigo-400/50">Cookie</th>
                    <th class="border-b border-slate-200 px-3 py-2.5 text-left font-mono text-2xs uppercase tracking-wider text-indigo-600/60 dark:border-slate-800 dark:text-indigo-400/50">Purpose</th>
                    <th class="border-b border-slate-200 px-3 py-2.5 text-left font-mono text-2xs uppercase tracking-wider text-indigo-600/60 dark:border-slate-800 dark:text-indigo-400/50">Duration</th>
                    <th class="border-b border-slate-200 px-3 py-2.5 text-left font-mono text-2xs uppercase tracking-wider text-indigo-600/60 dark:border-slate-800 dark:text-indigo-400/50">Type</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in cookieData" :key="row.name" class="border-b border-slate-100 transition-colors hover:bg-indigo-50/30 dark:border-slate-800/60 dark:hover:bg-vn-surface/30">
                    <td class="px-3 py-3 font-mono text-xs font-medium text-slate-900 dark:text-vn-white">{{ row.name }}</td>
                    <td class="px-3 py-3 text-xs text-slate-700 dark:text-slate-300">{{ row.purpose }}</td>
                    <td class="whitespace-nowrap px-3 py-3 text-xs text-slate-700 dark:text-slate-300">{{ row.duration }}</td>
                    <td class="px-3 py-3 text-xs text-slate-700 dark:text-slate-300">{{ row.type }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p class="mt-4 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              You can opt out of analytics cookies in your account settings at any time. Disabling strictly necessary cookies will prevent the platform from functioning.
            </p>
          </div>

          <!-- §08 -->
          <div id="priv-8" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">08</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">International data transfers</h2>
            </div>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              Volnux is incorporated in Ghana. If you are located in the European Economic Area, United Kingdom, or another jurisdiction with data transfer restrictions, we ensure that any transfer of your personal data outside that jurisdiction is protected by appropriate safeguards, including:
            </p>
            <ul class="space-y-0">
              <li class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                Standard Contractual Clauses (SCCs) approved by the European Commission
              </li>
              <li class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                Data processing agreements with all sub-processors specifying transfer safeguards
              </li>
              <li class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                Technical measures including encryption in transit and at rest
              </li>
            </ul>
            <p class="mt-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              Enterprise customers on the managed cloud tier can request data residency within a specific region. Contact us at <strong class="font-medium text-indigo-600 dark:text-indigo-400">privacy@volnux.dev</strong> to configure this.
            </p>
          </div>

          <!-- §09 -->
          <div id="priv-9" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">09</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Security</h2>
            </div>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              We implement technical and organisational security measures appropriate to the risk of processing personal data. These include:
            </p>
            <ul class="space-y-0">
              <li v-for="item in [
                'Encryption of all data in transit (TLS 1.3) and at rest (AES-256)',
                'mTLS mutual authentication for all inter-node communications in the execution mesh',
                'Role-based access controls and principle of least privilege for all staff access',
                'Immutable audit logs for all administrative actions on personal data',
                'Regular third-party security assessments and penetration testing',
                'Incident response procedures with breach notification within 72 hours to affected parties and regulators where required',
              ]" :key="item" class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                {{ item }}
              </li>
            </ul>
            <p class="mt-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              No system is completely secure. In the event of a security incident that affects your personal data, we will notify you promptly in accordance with applicable law.
            </p>
          </div>

          <!-- §10 -->
          <div id="priv-10" class="doc-section reveal-item pb-0 mb-0 opacity-0 translate-y-6 transition-all duration-700">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">10</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Changes to this policy</h2>
            </div>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              We may update this Privacy Policy from time to time. We will notify you of material changes by email to the address associated with your account at least 14 days before the changes take effect. The updated version will be identified by the revision date shown at the top of this page.
            </p>
            <p class="text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              Continued use of the Volnux Platform after the effective date of any changes constitutes acceptance of the updated Privacy Policy. If you do not accept the changes you may close your account before the effective date.
            </p>
          </div>
        </div>

        <!-- ════════════════════════════════
             TERMS OF SERVICE
        ════════════════════════════════ -->
        <div v-show="activeTab === 'terms'" class="space-y-0">

          <!-- Summary -->
          <div class="reveal-item mb-12 overflow-hidden rounded-xl border border-slate-200 bg-slate-50/80 opacity-0 translate-y-6 transition-all duration-700 dark:border-slate-800 dark:bg-vn-surface/30 sm:p-7">
            <div class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 dark:from-vn-accent dark:via-vn-accent2 dark:to-vn-accent3" style="position: relative;" />
            <div class="flex items-center gap-2 p-6 pb-0 sm:p-7 sm:pb-0">
              <span class="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-100 text-xs dark:bg-indigo-500/20">
                <svg class="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </span>
              <p class="font-mono text-2xs uppercase tracking-[0.15em] text-indigo-600 dark:text-indigo-400">Plain-language summary</p>
            </div>
            <p class="p-6 pt-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300 sm:p-7 sm:pt-3 sm:text-lg">
              By using Volnux you agree to use our services lawfully, not to abuse the platform, and to pay for what you use. We provide the platform as-is with the service levels described in your plan. You own your workflows and data. We own the platform. Both parties may terminate, subject to the notice periods below.
            </p>
          </div>

          <!-- §01 -->
          <div id="terms-1" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">01</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Acceptance of terms</h2>
            </div>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              These Terms of Service ("Terms") constitute a legally binding agreement between you (individually, or on behalf of your organisation) ("Customer") and Volnux ("we", "us", "Volnux") governing your use of the Volnux Platform, Pointy-lang tooling, EventHub registry, and all associated software and services (collectively, the "Service").
            </p>
            <p class="mb-4 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              By creating an account, clicking "I agree", or using any part of the Service you confirm that you have read, understood, and agree to be bound by these Terms. If you are using the Service on behalf of an organisation, you represent that you have the authority to bind that organisation to these Terms.
            </p>
            <!-- Warning callout -->
            <div class="overflow-hidden rounded-xl border border-rose-200/60 bg-rose-50/50 p-4 dark:border-rose-500/20 dark:bg-rose-500/5 sm:p-5">
              <div class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-rose-500 to-orange-500" style="position: relative;" />
              <div class="flex items-start gap-3">
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-rose-100 dark:bg-rose-500/20">
                  <svg class="h-3 w-3 text-rose-600 dark:text-rose-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" /></svg>
                </span>
                <div>
                  <p class="mb-1 font-mono text-2xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Note</p>
                  <p class="text-sm leading-[1.75] text-slate-700 dark:text-slate-300">
                    If you do not agree to these Terms, you may not use the Service. If you are under 18 years of age you may only use the Service with the involvement and consent of a parent or legal guardian.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- §02 -->
          <div id="terms-2" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">02</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Definitions</h2>
            </div>
            <div class="space-y-3">
              <div v-for="d in [
                { label: 'Service', text: 'The Volnux Platform, Pointy-lang compiler and wizard, EventHub registry, Mesh Runtime, CLI tooling, APIs, and all documentation and support services provided by Volnux.' },
                { label: 'Customer Content', text: 'All Pointy-lang workflow definitions, EventBase components, execution data, configuration files, and any other data or materials submitted by you to the Service.' },
                { label: 'Account', text: 'The account created by registering for the Service, including all associated organisations, teams, users, and subscription data.' },
                { label: 'Subscription', text: 'The plan under which you access the Service, as described on our pricing page, including the Open Core (free), and Platform (enterprise) tiers.' },
                { label: 'Authorised Users', text: 'Employees, contractors, or agents of the Customer who are permitted to access the Service under the Customer\'s Account in accordance with these Terms.' },
              ]" :key="d.label" class="group overflow-hidden rounded-xl border border-slate-200 bg-white transition-all duration-300 hover:border-indigo-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-indigo-500/20">
                <div class="h-[2px] bg-gradient-to-r from-indigo-500 to-violet-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:from-vn-accent dark:to-vn-accent2" />
                <div class="p-4">
                  <p class="mb-1 font-mono text-2xs uppercase tracking-[0.14em] text-indigo-600 dark:text-indigo-400">{{ d.label }}</p>
                  <p class="text-sm leading-[1.75] text-slate-700 dark:text-slate-300">{{ d.text }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- §03 -->
          <div id="terms-3" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">03</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Your account</h2>
            </div>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to:
            </p>
            <ul class="space-y-0">
              <li v-for="item in [
                'Provide accurate, current, and complete information when creating your account',
                'Maintain the security of your password and not share credentials between users',
                'Notify us immediately at security@volnux.dev if you suspect unauthorised access to your account',
                'Ensure that all Authorised Users comply with these Terms',
                'Accept responsibility for all actions taken through your account',
              ]" :key="item" class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                {{ item }}
              </li>
            </ul>
            <p class="mt-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              We reserve the right to terminate accounts that provide false registration information or that are used in violation of these Terms.
            </p>
          </div>

          <!-- §04 -->
          <div id="terms-4" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">04</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Acceptable use</h2>
            </div>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              You may use the Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service to:
            </p>
            <ul class="space-y-0">
              <li v-for="item in [
                'Violate any applicable local, national, or international law or regulation',
                'Transmit any material that is unlawful, harmful, threatening, abusive, defamatory, or otherwise objectionable',
                'Attempt to gain unauthorised access to the Service or any connected systems, networks, or data',
                'Introduce malware, viruses, or other malicious code into the Service or execution mesh',
                'Reverse-engineer, decompile, or attempt to extract the source code of any proprietary portion of the Service',
                'Use the Service to build a competing product or to benchmark against competitors without our written consent',
                'Circumvent or interfere with rate limits, access controls, or security measures',
                'Use the EventHub registry to publish components that infringe third-party intellectual property rights',
                'Resell or sublicense the Service without our prior written consent',
              ]" :key="item" class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                {{ item }}
              </li>
            </ul>
            <p class="mt-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              Volnux reserves the right to suspend or terminate access to the Service immediately, without prior notice, for material violations of this acceptable use policy.
            </p>
          </div>

          <!-- §05 -->
          <div id="terms-5" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">05</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Intellectual property</h2>
            </div>
            <h3 class="mb-2 border-b border-slate-200 pb-2 font-mono text-xs font-medium uppercase tracking-wider text-slate-900 dark:border-slate-800 dark:text-vn-white">Your content</h3>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              You retain full ownership of all Customer Content — your Pointy-lang workflows, EventBase components, configurations, and data. By submitting Customer Content to the Service you grant Volnux a limited, non-exclusive, worldwide, royalty-free licence to store, process, transmit, and display your Customer Content solely as necessary to provide the Service to you. This licence terminates when you delete the content or close your account.
            </p>
            <p class="mb-4 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              Volnux does not acquire any ownership rights in your Customer Content. Your Customer Content is not used to train machine learning models.
            </p>
            <h3 class="mb-2 border-b border-slate-200 pb-2 font-mono text-xs font-medium uppercase tracking-wider text-slate-900 dark:border-slate-800 dark:text-vn-white">Our platform</h3>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              The Volnux Platform, Pointy-lang language specification, EventHub registry software, Mesh Runtime, and all associated documentation are the intellectual property of Volnux and are protected by copyright, trademark, and other applicable laws.
            </p>
            <p class="mb-4 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              The open source components of the Volnux Platform are licensed under the terms of their respective open source licences (MIT for the core runtime). Proprietary components of the enterprise tier are not open source and may not be copied, modified, or redistributed without our written consent.
            </p>
            <h3 class="mb-2 border-b border-slate-200 pb-2 font-mono text-xs font-medium uppercase tracking-wider text-slate-900 dark:border-slate-800 dark:text-vn-white">Feedback</h3>
            <p class="text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              If you submit ideas, suggestions, or feedback about the Service ("Feedback"), you grant Volnux an irrevocable, perpetual, worldwide, royalty-free licence to use the Feedback for any purpose. We are not obligated to implement any Feedback.
            </p>
          </div>

          <!-- §06 -->
          <div id="terms-6" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">06</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Subscriptions and payment</h2>
            </div>
            <h3 class="mb-2 border-b border-slate-200 pb-2 font-mono text-xs font-medium uppercase tracking-wider text-slate-900 dark:border-slate-800 dark:text-vn-white">Plans and pricing</h3>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              The Service is available under the following plans, as described on our pricing page:
            </p>
            <ul class="space-y-0">
              <li class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                <strong class="font-medium text-slate-900 dark:text-vn-white">Open Core (Free):</strong> Full Pointy-lang language support, local execution, community EventHub access, and OpenTelemetry integration. No payment required.
              </li>
              <li class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                <strong class="font-medium text-slate-900 dark:text-vn-white">Platform (Enterprise):</strong> Managed execution mesh, private EventHub namespaces, governance dashboard, SSO, SLA-backed support, and dedicated onboarding. Subject to a written order form and the fees therein.
              </li>
            </ul>
            <h3 class="mt-6 mb-2 border-b border-slate-200 pb-2 font-mono text-xs font-medium uppercase tracking-wider text-slate-900 dark:border-slate-800 dark:text-vn-white">Billing</h3>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              Enterprise subscriptions are billed in accordance with the order form agreed between you and Volnux. Unless otherwise stated, fees are due in advance on a monthly or annual basis. All fees are non-refundable except as expressly stated in these Terms or required by applicable law.
            </p>
            <p class="text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              If payment fails, we will notify you and provide a grace period of 10 business days to update your payment method. If payment is not received after the grace period, we may suspend your access to paid features until payment is received.
            </p>
            <h3 class="mt-6 mb-2 border-b border-slate-200 pb-2 font-mono text-xs font-medium uppercase tracking-wider text-slate-900 dark:border-slate-800 dark:text-vn-white">Taxes</h3>
            <p class="text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              Fees do not include taxes, levies, or duties. You are responsible for paying all applicable taxes associated with your subscription, except for taxes based on Volnux's net income.
            </p>
          </div>

          <!-- §07 -->
          <div id="terms-7" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">07</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Service levels and availability</h2>
            </div>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              We endeavour to maintain high availability for the managed cloud tier. Specific SLA commitments are set out in the order form for Platform customers.
            </p>
            <ul class="space-y-0">
              <li class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                <strong class="font-medium text-slate-900 dark:text-vn-white">Open Core:</strong> Provided on a best-effort basis with no uptime commitment.
              </li>
              <li class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                <strong class="font-medium text-slate-900 dark:text-vn-white">Platform (Enterprise):</strong> 99.9% monthly uptime for the managed mesh and API. Scheduled maintenance windows are excluded. Credits issued for shortfalls as described in the order form.
              </li>
            </ul>
            <p class="mt-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              We reserve the right to modify, suspend, or discontinue any part of the Service with reasonable notice. We will provide at least 30 days' notice before discontinuing a feature on which you materially rely, except in the case of security emergencies.
            </p>
          </div>

          <!-- §08 -->
          <div id="terms-8" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">08</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Confidentiality</h2>
            </div>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              Each party may disclose confidential information to the other in connection with these Terms. Each party agrees to:
            </p>
            <ul class="space-y-0">
              <li v-for="item in [
                'Keep the other party\'s confidential information strictly confidential',
                'Not disclose it to third parties without prior written consent, except to employees or contractors who need to know it to perform obligations under these Terms',
                'Use the confidential information only for the purposes of these Terms',
                'Apply the same degree of protection as it applies to its own confidential information, but not less than reasonable care',
              ]" :key="item" class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                {{ item }}
              </li>
            </ul>
            <p class="mt-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              Confidential information does not include information that: (a) is or becomes publicly known through no fault of the receiving party; (b) was lawfully known to the receiving party before disclosure; or (c) is required to be disclosed by law, provided that the receiving party gives prompt written notice to the disclosing party where legally permitted.
            </p>
          </div>

          <!-- §09 -->
          <div id="terms-9" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">09</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Disclaimers and limitation of liability</h2>
            </div>
            <!-- Legal callout -->
            <div class="mb-4 overflow-hidden rounded-xl border border-rose-200/60 bg-rose-50/50 p-4 dark:border-rose-500/20 dark:bg-rose-500/5 sm:p-5">
              <div class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-rose-500 to-orange-500" style="position: relative;" />
              <div class="flex items-start gap-3">
                <span class="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-rose-100 dark:bg-rose-500/20">
                  <svg class="h-3 w-3 text-rose-600 dark:text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>
                </span>
                <div>
                  <p class="mb-1 font-mono text-2xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">Legal</p>
                  <p class="text-sm leading-[1.75] text-slate-700 dark:text-slate-300">
                    The Service is provided "as is" and "as available" without warranty of any kind, express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
                  </p>
                </div>
              </div>
            </div>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              To the fullest extent permitted by applicable law, Volnux's total liability to you for any claim arising out of or relating to these Terms or the Service shall not exceed the greater of: (a) the amount you paid to Volnux in the 12 months preceding the claim; or (b) USD 100.
            </p>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              In no event will Volnux be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, revenue, data, or business, even if advised of the possibility of such damages.
            </p>
            <p class="text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              Some jurisdictions do not allow the exclusion or limitation of certain warranties or liabilities, so some of the above limitations may not apply to you.
            </p>
          </div>

          <!-- §10 -->
          <div id="terms-10" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">10</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Term and termination</h2>
            </div>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              These Terms commence on the date you first accept them and continue until terminated.
            </p>
            <h3 class="mb-2 border-b border-slate-200 pb-2 font-mono text-xs font-medium uppercase tracking-wider text-slate-900 dark:border-slate-800 dark:text-vn-white">Termination by you</h3>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              You may terminate your account at any time by following the account deletion process in your account settings. For enterprise subscriptions, please refer to the notice period in your order form (typically 30 days written notice).
            </p>
            <h3 class="mb-2 border-b border-slate-200 pb-2 font-mono text-xs font-medium uppercase tracking-wider text-slate-900 dark:border-slate-800 dark:text-vn-white">Termination by us</h3>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              We may terminate your access to the Service immediately without notice if: (a) you materially breach these Terms and fail to cure the breach within 10 business days of written notice; (b) you engage in fraudulent or abusive behaviour; or (c) we are required to do so by law.
            </p>
            <p class="mb-4 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              We may terminate the Service on 90 days' notice if we decide to discontinue it generally.
            </p>
            <h3 class="mb-2 border-b border-slate-200 pb-2 font-mono text-xs font-medium uppercase tracking-wider text-slate-900 dark:border-slate-800 dark:text-vn-white">Effect of termination</h3>
            <ul class="space-y-0">
              <li v-for="item in [
                'Your right to access and use the Service ceases immediately on the effective date of termination',
                'You may export your Customer Content for 30 days following termination',
                'After 30 days, your Customer Content will be deleted from our systems subject to our data retention obligations',
                'Sections 5 (Intellectual property), 8 (Confidentiality), 9 (Liability), and 12 (Governing law) survive termination',
              ]" :key="item" class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                {{ item }}
              </li>
            </ul>
          </div>

          <!-- §11 -->
          <div id="terms-11" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">11</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">EventHub publisher obligations</h2>
            </div>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              If you publish EventBase components to the EventHub registry you additionally agree to the following:
            </p>
            <ul class="space-y-0">
              <li v-for="item in [
                'You represent that you own or have the rights to publish all code in your components and their transitive dependencies',
                'You agree not to publish components containing malicious code, security exploits, or code designed to circumvent the Volnux runtime\'s execution boundaries',
                'You agree to maintain accurate manifest documentation including version history, parameter schemas, and deprecation notices',
                'You grant Volnux a licence to store, distribute, and display your published components to other users of the EventHub registry',
                'You agree to respond to security vulnerability reports within 30 days and to publish patches or deprecate affected versions accordingly',
                'You acknowledge that Volnux may remove components from the registry that violate these Terms or applicable law, with notice where practicable',
              ]" :key="item" class="relative border-b border-slate-100 py-2.5 pl-5 text-sm leading-[1.75] text-slate-700 last:border-b-0 dark:border-slate-700/60 dark:text-slate-300">
                <span class="absolute left-1 top-3 text-indigo-500 dark:text-vn-accent">&bull;</span>
                {{ item }}
              </li>
            </ul>
          </div>

          <!-- §12 -->
          <div id="terms-12" class="doc-section reveal-item border-b border-slate-200 pb-14 mb-14 opacity-0 translate-y-6 transition-all duration-700 dark:border-vn-border">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">12</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Governing law and disputes</h2>
            </div>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              These Terms are governed by the laws of the Republic of Ghana, without regard to conflict of law principles. Any dispute arising out of or in connection with these Terms shall first be subject to good-faith negotiation between the parties. If the dispute is not resolved within 30 days of written notice, it shall be submitted to binding arbitration in Accra, Ghana, under the rules of the Ghana Arbitration Centre.
            </p>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              Nothing in this clause prevents either party from seeking urgent injunctive relief in any court of competent jurisdiction to prevent irreparable harm.
            </p>
            <p class="text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              If you are a consumer in the European Union, you also have the right to bring a claim before the courts of your country of residence.
            </p>
          </div>

          <!-- §13 -->
          <div id="terms-13" class="doc-section reveal-item pb-0 mb-0 opacity-0 translate-y-6 transition-all duration-700">
            <div class="mb-6 flex items-start gap-4">
              <span class="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 font-mono text-2xs font-bold text-white shadow-sm dark:from-vn-accent dark:to-vn-accent2">13</span>
              <h2 class="font-display text-xl font-bold tracking-tight text-slate-900 sm:text-2xl dark:text-vn-white">Changes to these terms</h2>
            </div>
            <p class="mb-3 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              We may update these Terms from time to time. We will notify you of material changes by email at least 30 days before they take effect. The updated Terms will be identified by the revision date shown at the top of this page. Continued use of the Service after the effective date constitutes acceptance.
            </p>
            <p class="mb-4 text-base leading-[1.75] text-slate-700 dark:text-slate-300">
              If we make changes that materially reduce your rights, you may terminate your account before the effective date and receive a pro-rata refund of any prepaid fees for the remaining subscription term.
            </p>

            <!-- Contact card -->
            <div class="group flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 transition-all duration-300 hover:border-indigo-200 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900/30 dark:hover:border-indigo-500/20">
              <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 transition-colors group-hover:bg-indigo-200 dark:bg-indigo-500/15 dark:group-hover:bg-indigo-500/25">
                <svg class="h-4 w-4 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 18 18"><rect x="2" y="4" width="14" height="10" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M2 6l7 5 7-5" stroke="currentColor" stroke-width="1.4"/></svg>
              </div>
              <div>
                <p class="font-mono text-2xs uppercase tracking-wider text-slate-400 dark:text-slate-500">Legal enquiries</p>
                <p class="font-mono text-sm font-medium text-indigo-600 dark:text-indigo-400">legal@volnux.dev</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </main>
</template>
