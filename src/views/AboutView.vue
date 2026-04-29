<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// Intersection Observer for scroll animations
const mainEl = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

onMounted(() => {
  const el = mainEl.value
  if (!el) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          ;(e.target as HTMLElement).classList.add('on')
        }
      })
    },
    { threshold: 0.1 }
  )

  el.querySelectorAll<HTMLElement>('.vn-reveal, .reveal-stagger').forEach((node) => {
    observer?.observe(node)
  })
})

onUnmounted(() => observer?.disconnect())

// Ticker items
const tickerItems = [
  'Workflow Orchestration',
  'Business Automation',
  'P2P Mesh Execution',
  'Pointy-lang DSL',
  'AI Agent Infrastructure',
  'Distributed Checkpointing',
  'EventHub Registry',
  'OpenTelemetry Native',
  'Workflow Governance',
  'Open Core',
]

// Products data
const products = [
  {
    num: '01',
    title: 'Volnux Platform',
    description: 'The core workflow operating system. A decentralised P2P execution mesh with native checkpointing, OpenTelemetry integration, and smart serverless task dispatch. No central scheduler. No single point of failure. Workflows that heal themselves and report everything.',
    tags: [
      { label: 'workflow engine', variant: 'accent' },
      { label: 'P2P mesh', variant: 'accent2' },
      { label: 'checkpointing', variant: 'default' },
      { label: 'OTEL', variant: 'default' },
      { label: 'open core', variant: 'accent' },
    ],
    link: { href: '/', text: 'Visit platform' },
  },
  {
    num: '02',
    title: 'Pointy-lang',
    description: 'A purpose-built declarative DSL for workflow authoring. Arrow-based syntax that expresses control flow, parallelism, retries, conditional branching, and remote dispatch in syntax readable by engineers and non-engineers alike. Compiled to an in-memory execution graph by the Volnux runtime.',
    tags: [
      { label: 'DSL', variant: 'accent' },
      { label: 'compiler', variant: 'default' },
      { label: 'readable', variant: 'accent2' },
      { label: 'PLY / YACC', variant: 'default' },
      { label: 'governance', variant: 'accent4' },
    ],
    link: { href: '/', text: 'Documentation' },
  },
  {
    num: '03',
    title: 'EventHub',
    description: 'An open registry for Volnux EventBase components. Publish versioned, schema-validated workflow event classes to PyPI, Git, or the community hub. Reference them by name in any Pointy-lang workflow — Volnux pulls and executes them at runtime. No deployment. No shared codebase.',
    tags: [
      { label: 'registry', variant: 'accent4' },
      { label: 'component marketplace', variant: 'default' },
      { label: 'versioning', variant: 'accent2' },
      { label: 'manifest schema', variant: 'default' },
    ],
    link: { href: '/products/eventhub', text: 'Browse EventHub' },
  },
  {
    num: '04',
    title: 'Pointy-lang Wizard',
    description: 'A visual workflow canvas for building Pointy-lang pipelines without writing code. Drag-and-drop EventBase components from the EventHub palette, connect them with edges, configure node annotations, and export the generated Pointy-lang definition directly. The bridge between workflow governance and visual authoring.',
    tags: [
      { label: 'visual canvas', variant: 'accent2' },
      { label: 'drag-and-drop', variant: 'default' },
      { label: 'no-code', variant: 'accent' },
      { label: 'Pointy-lang', variant: 'default' },
    ],
    link: { href: '/products/pointy-lang', text: 'Try the wizard' },
  },
]

// Principles data
const principles = [
  {
    num: '01',
    title: 'Governance is not optional',
    description: 'A workflow that cannot be audited, explained, or intervened upon is not ready for production. We design every system so that governance is the path of least resistance, not an add-on.',
  },
  {
    num: '02',
    title: 'Decentralisation by default',
    description: 'Central schedulers are single points of failure and single points of bottleneck. Every Volnux system is designed to operate without a coordinator — nodes negotiate, tasks self-route, failures self-heal.',
  },
  {
    num: '03',
    title: 'The definition is the documentation',
    description: 'Separate documentation always goes stale. When the workflow definition itself is readable by any stakeholder, governance is self-maintaining as the system evolves. Pointy-lang is the executable documentation.',
  },
  {
    num: '04',
    title: 'Version everything, trust nothing floating',
    description: 'An execution that cannot be reproduced cannot be audited. Every component, configuration, and workflow definition is version-pinned. Floating references are a governance failure waiting to happen.',
  },
  {
    num: '05',
    title: 'Infrastructure should be boring',
    description: 'Workflow engines should be the least interesting part of your stack — reliable, transparent, and invisible when things are going well. Excitement in infrastructure is usually a symptom of something broken.',
  },
  {
    num: '06',
    title: 'Open core, not open bait',
    description: 'The runtime, the language, and the core execution model are and will remain open source. We make money on the managed cloud, the enterprise governance layer, and the private EventHub — not by restricting the infrastructure itself.',
  },
]

// Stack layers data
const stackLayers = [
  {
    num: 'Layer 01 — Language',
    title: 'Pointy-lang',
    description: 'The declarative DSL that makes workflows readable. Built with PLY / YACC. Compiles to an in-memory execution graph.',
    items: ['Arrow-based control flow', 'Operator precedence grammar', 'Parallel fan-out / barriers', 'Conditional branching', 'Functional meta-events (MAP)', 'Node / executor annotations'],
    color: 'bg-vn-accent',
  },
  {
    num: 'Layer 02 — Runtime',
    title: 'Volnux Core',
    description: 'The execution engine. Manages event lifecycle, context, checkpointing, and result evaluation.',
    items: ['EventBase abstraction', 'Adaptive MiniExecutionContext', 'Reservoir sampling telemetry', 'Retry / evaluation strategies', 'Checkpoint and rehydration', 'Trigger engine lifecycle'],
    color: 'bg-vn-accent2',
  },
  {
    num: 'Layer 03 — Mesh',
    title: 'Mesh Runtime',
    description: 'The distributed execution layer. P2P topology with mTLS, adaptive streaming, and self-healing.',
    items: ['P2P node discovery', 'mTLS inter-node auth', 'TCP / gRPC transport', 'Celery worker dispatch', 'Watchdog and reconnect', 'Batch streaming (Redis)'],
    color: 'bg-vn-accent4',
  },
  {
    num: 'Layer 04 — Registry',
    title: 'EventHub',
    description: 'The component ecosystem. Runtime assembly from PyPI, Git, or the community registry.',
    items: ['volnux.manifest.json schema', 'Version-pinned resolution', 'Deprecation lifecycle', 'Private org registries', 'CLI manifest commands', 'JSON Schema validation'],
    color: 'bg-vn-accent3',
  },
]

// Differentiators data
const differentiators = [
  {
    label: 'Architecture',
    title: 'Decentralised P2P mesh',
    description: 'No central scheduler. No coordinator process. Every node is a full peer. Tasks self-route, failures self-heal, the mesh scales horizontally without configuration.',
  },
  {
    label: 'Language',
    title: 'Purpose-built DSL',
    description: 'Pointy-lang is not a library or a decorator system. It is a compiled language with a formal grammar. Readable by non-engineers. Executable by the runtime. The definition is the documentation.',
  },
  {
    label: 'Governance',
    title: 'Structural, not bolted on',
    description: 'Auditability, checkpointing, and execution tracing are not features you enable. They are properties of every workflow by construction. You cannot create an ungovernable workflow in Volnux.',
  },
  {
    label: 'Component model',
    title: 'Runtime assembly',
    description: 'Workflows reference versioned components by name. The runtime fetches them at execution time. No shared codebase. No deployment coordination. Any node can run any workflow.',
  },
  {
    label: 'AI readiness',
    title: 'Agent-native by design',
    description: 'LLM calls, multi-agent fan-out, conditional intent routing, and checkpoint-across-inference are first-class patterns in Pointy-lang. Not workarounds. Not plugins.',
  },
]

// Industries data
const industries = [
  { icon: 'ii-ember', emoji: '◆', title: 'Financial Services', description: 'Trading, settlement, risk management, compliance reporting, and audit-ready workflows for regulated markets.', examples: ['Trade Settlement', 'Risk Reporting', 'Compliance Audits'] },
  { icon: 'ii-blue', emoji: '◆', title: 'Healthcare', description: 'HIPAA-compliant data pipelines, clinical trial automation, and patient workflow orchestration with full audit trails.', examples: ['Clinical Data', 'Patient Intake', 'Trial Automation'] },
  { icon: 'ii-gold', emoji: '◆', title: 'Manufacturing', description: 'Supply chain orchestration, predictive maintenance pipelines, and IoT data processing at scale.', examples: ['Supply Chain', 'Maintenance', 'IoT Pipelines'] },
  { icon: 'ii-green', emoji: '◆', title: 'E-commerce', description: 'Order fulfillment, inventory management, fraud detection, and real-time recommendation pipelines.', examples: ['Order Fulfillment', 'Inventory Sync', 'Fraud Detection'] },
  { icon: 'ii-purple', emoji: '◆', title: 'Data Engineering', description: 'ETL/ELT pipelines, data warehouse ingestion, streaming analytics, and ML feature engineering.', examples: ['ETL Pipelines', 'Streaming Analytics', 'ML Features'] },
  { icon: 'ii-teal', emoji: '◆', title: 'AI / ML', description: 'Model training pipelines, inference serving, agent orchestration, and LLM-powered workflows.', examples: ['Training Pipelines', 'Agent Systems', 'LLM Workflows'] },
]

// Facts data
const facts = [
  { num: '2+', label: 'Core products in active development' },
  { num: '1.2M+', label: 'EventHub monthly component pulls' },
  { num: '0', label: 'Central schedulers required' },
  { num: '∞', label: 'Scale without rewrites' },
]

// Open positions
const roles = [
  { title: 'Senior Platform Engineer', location: 'Remote', badge: 'New', badgeClass: 'bg-vn-accent/10 text-vn-accent border-vn-accent/30' },
  { title: 'Distributed Systems Engineer', location: 'Remote', badge: 'Open', badgeClass: 'bg-vn-accent4/10 text-vn-accent4 border-vn-accent4/30' },
  { title: 'Language Designer', location: 'Remote', badge: 'Remote', badgeClass: 'bg-vn-accent2/10 text-vn-accent2 border-vn-accent2/30' },
]
</script>

<template>
  <main ref="mainEl" class="relative z-10">
    <!-- Hero Section -->
    <section id="hero" class="relative flex min-h-screen flex-col justify-end overflow-hidden border-b border-vn-border">
      <!-- Background text -->
      <div class="pointer-events-none absolute bottom-0 left-0 select-none whitespace-nowrap font-display text-[14rem] font-bold leading-[0.85] tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.04)] sm:text-[18rem] md:text-[22rem] lg:text-[28rem]">
        VOLNUX
      </div>

      <!-- Diagonal accent stripe -->
      <div class="pointer-events-none absolute right-[20%] top-0 h-full w-px bg-gradient-to-b from-transparent via-vn-accent to-transparent opacity-25" />

      <div class="vn-container relative z-10 pb-16 pt-24 sm:pb-20 sm:pt-28 lg:pb-24">
        <div class="grid grid-cols-1 items-end gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-8">
          <!-- Main content -->
          <div class="vn-reveal">
            <p class="vn-section-tag mb-6">Infrastructure for the automated enterprise</p>

            <h1 class="mb-6 font-display text-3xl font-bold leading-[0.95] tracking-tight text-vn-white sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl">
              <span class="block">WE BUILD THE</span>
              <span class="block text-vn-accent">ENGINES THAT</span>
              <span class="block">RUN YOUR</span>
              <span class="block text-vn-muted">BUSINESS.</span>
            </h1>

            <p class="mb-8 max-w-lg text-base leading-relaxed text-vn-text2 sm:text-lg">
              Volnux is an infrastructure company. We build workflow engines, automation runtimes, and developer tools that help organisations deploy, govern, and scale their most critical automated processes — from data pipelines to AI agent systems.
            </p>

            <div class="flex flex-wrap gap-3">
              <a href="#products" class="vn-btn-primary">Our products</a>
              <a href="/" class="vn-btn-outline">Volnux Platform</a>
              <a href="#join" class="vn-btn-ghost">Work with us</a>
            </div>
          </div>

          <!-- Stats sidebar -->
          <div class="vn-reveal hidden border-l border-vn-border pl-8 lg:block lg:self-stretch">
            <div class="flex h-full flex-col justify-end">
              <div v-for="(stat, i) in [
                { num: '2', suffix: '+', label: 'Core products in active development' },
                { num: '1.2', mid: 'M', suffix: '+', label: 'EventHub monthly component pulls' },
                { num: '0', suffix: '', label: 'Central schedulers required' },
              ]" :key="i" class="border-b border-vn-border py-5 last:border-b-0">
                <div class="font-display text-4xl font-bold tracking-tight text-vn-white sm:text-5xl">
                  {{ stat.num }}<span class="text-vn-accent">{{ stat.mid }}</span><span class="text-vn-accent">{{ stat.suffix }}</span>
                </div>
                <div class="mt-1 font-mono text-xs uppercase tracking-wider text-vn-muted">
                  {{ stat.label }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Ticker Section -->
    <div class="relative z-10 flex h-9 items-center overflow-hidden border-b border-vn-border bg-vn-accent">
      <div class="animate-ticker flex whitespace-nowrap">
        <span v-for="(item, i) in [...tickerItems, ...tickerItems]" :key="i" class="flex items-center gap-4 px-8">
          <span class="font-mono text-xs font-medium uppercase tracking-wider text-vn-black/70">{{ item }}</span>
          <span class="text-xs text-vn-black/50">◆</span>
        </span>
      </div>
    </div>

    <!-- Mission Section -->
    <section id="mission" class="vn-section border-b border-vn-border bg-vn-surface">
      <div class="vn-container">
        <div class="grid grid-cols-1 gap-0 lg:grid-cols-2">
          <!-- Left: Mission text -->
          <div class="vn-reveal border-b border-vn-border pb-12 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-12">
            <p class="vn-section-tag">Our mission</p>
            <h2 class="vn-section-title">
              MAKING<br>AUTOMATION<br><span class="text-vn-accent">GOVERNABLE.</span>
            </h2>
            <div class="mt-8 space-y-5 text-sm leading-relaxed text-vn-text2 sm:text-base">
              <p>
                Every organisation running at scale is running on automation. Data pipelines. Approval workflows. AI agents. Notification chains. Deployment processes. The more successful an organisation becomes, the more automation it depends on — and the harder it becomes to understand, govern, and trust that automation.
              </p>
              <p>
                Volnux was founded on a single conviction: the infrastructure for business automation has not kept pace with the scale and complexity of the businesses that depend on it. Schedulers designed for batch jobs are being asked to orchestrate AI agents. Python scripts written by engineers three years ago are running critical financial processes. Nobody can explain to a compliance officer what any of it does.
              </p>
              <p>
                We are building the operating system for operations — a complete execution substrate that makes every workflow in your organisation readable, reliable, and governable from day one. Not as an afterthought. Not as a compliance checkbox. As the foundation.
              </p>
            </div>
          </div>

          <!-- Right: Quote -->
          <div class="vn-reveal pt-12 lg:pl-12 lg:pt-0">
            <div class="border-l-4 border-vn-accent pl-6">
              <blockquote class="mb-4 font-display text-xl font-bold leading-tight tracking-tight text-vn-white sm:text-2xl md:text-3xl">
                "The organisations that win the next decade will not be the ones that automate the most — they will be the ones that can <span class="text-vn-accent">explain, audit, and govern</span> what their automation is doing."
              </blockquote>
              <cite class="flex items-center gap-2 font-mono text-xs uppercase tracking-wider text-vn-muted not-italic">
                <span class="h-px w-4 bg-vn-muted"></span>
                Volnux founding thesis
              </cite>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Products Section -->
    <section id="products" class="vn-section border-b border-vn-border">
      <div class="vn-container">
        <!-- Header -->
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 lg:items-end mb-12">
          <div class="vn-reveal">
            <p class="vn-section-tag">What we build</p>
            <h2 class="vn-section-title">OUR<br><span class="text-vn-accent">PRODUCTS.</span></h2>
          </div>
          <div class="vn-reveal">
            <p class="text-sm leading-relaxed text-vn-text2 sm:text-base">
              Every product Volnux builds is a piece of the same system — an integrated stack for building, deploying, and governing automated workflows at any scale. From a single developer running a local pipeline to an enterprise operating a global distributed mesh.
            </p>
          </div>
        </div>

        <!-- Product list -->
        <div class="reveal-stagger flex flex-col">
          <div
            v-for="(product, i) in products"
            :key="i"
            class="group grid grid-cols-1 gap-4 border-t border-vn-border py-8 transition-colors hover:border-vn-accent sm:grid-cols-[80px_1fr] md:grid-cols-[80px_1fr_auto] sm:gap-6 md:gap-10 md:py-10"
          >
            <!-- Number -->
            <div class="font-display text-4xl font-bold leading-none text-vn-border2 transition-colors group-hover:text-vn-accent/20 sm:text-5xl md:text-6xl">
              {{ product.num }}
            </div>

            <!-- Content -->
            <div>
              <h3 class="mb-2 font-display text-xl font-bold tracking-tight text-vn-white transition-colors group-hover:text-vn-accent sm:text-2xl md:text-3xl">
                {{ product.title }}
              </h3>
              <p class="mb-4 max-w-xl text-sm leading-relaxed text-vn-text2 sm:text-base">
                {{ product.description }}
              </p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="tag in product.tags"
                  :key="tag.label"
                  class="font-mono text-xs"
                  :class="{
                    'rounded border border-vn-border px-2 py-1 text-vn-muted': tag.variant === 'default',
                    'rounded border border-vn-accent/25 bg-vn-accent/5 px-2 py-1 text-vn-accent': tag.variant === 'accent',
                    'rounded border border-vn-accent2/25 bg-vn-accent2/5 px-2 py-1 text-vn-accent2': tag.variant === 'accent2',
                    'rounded border border-vn-accent4/25 bg-vn-accent4/5 px-2 py-1 text-vn-accent4': tag.variant === 'accent4',
                  }"
                >
                  {{ tag.label }}
                </span>
              </div>
            </div>

            <!-- Link -->
            <div class="hidden md:block">
              <a
                :href="product.link.href"
                class="inline-flex items-center gap-1 font-mono text-xs text-vn-muted transition-colors hover:text-vn-accent whitespace-nowrap border border-vn-border rounded px-3 py-2 hover:border-vn-accent"
              >
                {{ product.link.text }} →
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Principles Section -->
    <section id="principles" class="vn-section border-b border-vn-border bg-vn-surface">
      <div class="vn-container">
        <div class="grid grid-cols-1 gap-10 lg:grid-cols-[340px_1fr] lg:gap-16">
          <!-- Sticky header -->
          <div class="vn-reveal lg:sticky lg:top-24 lg:self-start">
            <p class="vn-section-tag">How we think</p>
            <h2 class="vn-section-title">ENGINEERING<br><span class="text-vn-accent">PRINCIPLES.</span></h2>
            <p class="mt-6 text-sm leading-relaxed text-vn-muted sm:text-base">
              Every technical decision at Volnux is grounded in a small number of principles that do not change. These are not aspirations — they are constraints that shape what we build and what we refuse to build.
            </p>
          </div>

          <!-- Principles list -->
          <div class="reveal-stagger flex flex-col">
            <div
              v-for="(principle, i) in principles"
              :key="i"
              class="grid grid-cols-1 gap-4 border-b border-vn-border py-8 first:pt-0 last:border-b-0 sm:grid-cols-[60px_1fr] sm:gap-6 sm:py-10"
            >
              <div class="font-display text-3xl font-bold leading-none text-vn-border2 sm:text-4xl">
                {{ principle.num }}
              </div>
              <div>
                <h3 class="mb-2 font-mono text-sm font-medium text-vn-white sm:text-base">
                  {{ principle.title }}
                </h3>
                <p class="text-sm leading-relaxed text-vn-text2 sm:text-base">
                  {{ principle.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Technology Stack Section -->
    <section id="stack" class="vn-section border-b border-vn-border">
      <div class="vn-container">
        <div class="vn-reveal mb-10">
          <p class="vn-section-tag">Technology</p>
          <h2 class="vn-section-title">THE <span class="text-vn-accent">STACK.</span></h2>
          <p class="vn-section-sub mt-4">
            Four layers. Each designed for a specific job. Together they form a complete execution substrate for business automation at any scale.
          </p>
        </div>

        <!-- Stack grid -->
        <div class="reveal-stagger grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-vn-border bg-vn-border sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="(layer, i) in stackLayers"
            :key="i"
            class="relative bg-vn-surface p-6 transition-colors hover:bg-vn-surface2 sm:p-8"
          >
            <!-- Top accent line -->
            <div class="absolute inset-x-0 top-0 h-1" :class="layer.color"></div>

            <div class="mb-3 font-mono text-xs uppercase tracking-wider text-vn-muted">{{ layer.num }}</div>
            <h3 class="mb-3 font-display text-lg font-bold tracking-tight text-vn-white sm:text-xl">{{ layer.title }}</h3>
            <p class="mb-5 text-sm leading-relaxed text-vn-muted">{{ layer.description }}</p>
            <ul class="flex flex-col gap-1.5">
              <li
                v-for="item in layer.items"
                :key="item"
                class="flex items-center gap-2 font-mono text-xs text-vn-muted transition-colors hover:text-vn-text"
              >
                <span class="h-1.5 w-1.5 shrink-0 rounded-full" :class="layer.color"></span>
                {{ item }}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- Why Volnux Section -->
    <section id="why" class="vn-section border-b border-vn-border bg-vn-surface">
      <div class="vn-container">
        <div class="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <!-- Left: Text -->
          <div class="vn-reveal">
            <p class="vn-section-tag">Differentiation</p>
            <h2 class="vn-section-title">WHY<br><span class="text-vn-accent">VOLNUX.</span></h2>
            <div class="mt-8 space-y-5 text-sm leading-relaxed text-vn-text2 sm:text-base">
              <p>
                Every major workflow engine was built before AI agents, before governance became a regulatory requirement, and before the scale of modern distributed infrastructure made central schedulers a liability.
              </p>
              <p>
                Volnux is the first workflow engine designed from first principles for the world that actually exists — one where workflows cross team and organisational boundaries, AI systems make consequential decisions at machine speed, and explainability is not optional.
              </p>
              <p>
                We are not trying to be a better Airflow or a simpler Temporal. We are building something categorically different: a workflow operating system where governance, readability, and decentralisation are structural properties — not features you configure.
              </p>
            </div>
          </div>

          <!-- Right: Differentiators -->
          <div class="vn-reveal">
            <div class="flex flex-col gap-px overflow-hidden rounded-lg border border-vn-border bg-vn-border">
              <div
                v-for="(diff, i) in differentiators"
                :key="i"
                class="bg-vn-surface p-5 transition-colors hover:bg-vn-surface2 sm:p-6"
              >
                <div class="mb-3 font-mono text-xs uppercase tracking-wider text-vn-muted">{{ diff.label }}</div>
                <div class="mb-2 font-mono text-sm font-medium text-vn-white">{{ diff.title }}</div>
                <p class="text-sm leading-relaxed text-vn-muted">{{ diff.description }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Industries Section -->
    <section id="industries" class="vn-section border-b border-vn-border">
      <div class="vn-container">
        <div class="vn-reveal mb-10">
          <p class="vn-section-tag">Industries</p>
          <h2 class="vn-section-title">WHO WE<br><span class="text-vn-accent">SERVE.</span></h2>
          <p class="vn-section-sub mt-4">
            Volnux infrastructure is domain-agnostic. The same execution substrate serves any organisation that runs critical automated processes.
          </p>
        </div>

        <div class="reveal-stagger grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-vn-border bg-vn-border sm:grid-cols-2 lg:grid-cols-3">
          <div
            v-for="(industry, i) in industries"
            :key="i"
            class="bg-vn-surface p-6 transition-colors hover:bg-vn-surface2 sm:p-8"
          >
          <div class="mb-4 flex h-11 w-11 items-center justify-center rounded border text-xl" :class="{
            'border-vn-accent4/20 bg-vn-accent4/10 text-vn-accent4': industry.icon === 'ii-ember' || industry.icon === 'ii-gold',
            'border-vn-accent2/20 bg-vn-accent2/10 text-vn-accent2': industry.icon === 'ii-blue' || industry.icon === 'ii-purple',
            'border-vn-accent3/20 bg-vn-accent3/10 text-vn-accent3': industry.icon === 'ii-green',
            'border-vn-accent/20 bg-vn-accent/10 text-vn-accent': industry.icon === 'ii-teal',
          }">
              {{ industry.emoji }}
            </div>
            <h3 class="mb-2 font-display text-lg font-bold tracking-tight text-vn-white sm:text-xl">{{ industry.title }}</h3>
            <p class="mb-4 text-sm leading-relaxed text-vn-muted">{{ industry.description }}</p>
            <div class="flex flex-col gap-1">
              <span v-for="example in industry.examples" :key="example" class="flex items-center gap-1.5 font-mono text-xs text-vn-muted">
                <span class="text-vn-border2">→</span>
                {{ example }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Open Source Section -->
    <section id="open" class="vn-section border-b border-vn-border bg-vn-surface">
      <div class="vn-container">
        <div class="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16 lg:items-center">
          <!-- Left: Content -->
          <div class="vn-reveal">
            <p class="vn-section-tag">Open Source</p>
            <h2 class="vn-section-title">BUILT IN<br><span class="text-vn-accent">THE OPEN.</span></h2>
            <div class="mt-6 space-y-4 text-sm leading-relaxed text-vn-text2 sm:text-base">
              <p>
                Volnux is open core. The runtime, the language, and the core execution model are and will remain open source under the Apache 2.0 license.
              </p>
              <p>
                We believe infrastructure for critical automation should be inspectable, auditable, and improvable by the organisations that depend on it. We make money on the managed cloud and enterprise features — not by restricting the infrastructure itself.
              </p>
            </div>
          </div>

          <!-- Right: Terminal -->
          <div class="vn-reveal">
            <div class="overflow-hidden rounded-lg border border-vn-border bg-vn-black">
              <!-- Terminal header -->
              <div class="flex items-center gap-2 border-b border-vn-border px-4 py-3">
                <span class="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                <span class="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
                <span class="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                <span class="ml-auto font-mono text-xs text-vn-muted">zsh</span>
              </div>
              <!-- Terminal body -->
              <div class="p-4 font-mono text-xs leading-relaxed text-vn-text sm:p-5 sm:text-sm">
                <div class="mb-2">
                  <span class="text-vn-accent3">$</span>
                  <span class="text-vn-text ml-2">pip install volnux</span>
                </div>
                <div class="mb-2 text-vn-muted">Collecting volnux...</div>
                <div class="mb-2 text-vn-muted">Installing collected packages: volnux</div>
                <div class="mb-4 text-vn-accent3">Successfully installed volnux-0.8.2</div>
                <div class="mb-2">
                  <span class="text-vn-accent3">$</span>
                  <span class="text-vn-text ml-2">volnux --version</span>
                </div>
                <div class="mb-4 text-vn-accent4">volnux 0.8.2</div>
                <div class="mb-2">
                  <span class="text-vn-accent3">$</span>
                  <span class="text-vn-text ml-2">volnux init my-workflow</span>
                </div>
                <div class="text-vn-muted">Created my-workflow/pipeline.pointy</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Facts Section -->
    <section id="facts" class="relative overflow-hidden border-b border-vn-border bg-vn-accent py-16 sm:py-20">
      <!-- Background text -->
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <span class="font-display text-[8rem] font-bold tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(0,0,0,0.1)] sm:text-[12rem] lg:text-[16rem]">
          VOLNUX
        </span>
      </div>

      <div class="vn-container relative z-10">
        <div class="grid grid-cols-2 gap-0 lg:grid-cols-4">
          <div
            v-for="(fact, i) in facts"
            :key="i"
            class="border-r border-vn-black/15 px-4 py-6 text-center last:border-r-0 sm:px-8 sm:py-8"
          >
            <div class="font-display text-3xl font-bold text-vn-black sm:text-4xl md:text-5xl">{{ fact.num }}</div>
            <div class="mt-2 font-mono text-xs uppercase tracking-wider text-vn-black/60">{{ fact.label }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Join Us Section -->
    <section id="join" class="vn-section border-b border-vn-border bg-vn-surface">
      <div class="vn-container">
        <div class="grid grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-16">
          <!-- Left: Content -->
          <div class="vn-reveal">
            <p class="vn-section-tag">Join us</p>
            <h2 class="vn-section-title">BUILD THE<br><span class="text-vn-accent">FUTURE.</span></h2>
            <div class="mt-6 space-y-4 text-sm leading-relaxed text-vn-text2 sm:text-base">
              <p>
                We are a team of infrastructure engineers, language designers, and distributed systems specialists building the next generation of workflow automation.
              </p>
              <p>
                If you believe infrastructure should be readable, workflows should be governable, and automation should not require a PhD to understand, we would love to hear from you.
              </p>
            </div>
          </div>

          <!-- Right: Roles -->
          <div class="vn-reveal">
            <div class="flex flex-col">
              <a
                v-for="(role, i) in roles"
                :key="i"
                href="#"
                class="group flex items-center justify-between border-b border-vn-border px-4 py-4 transition-colors hover:bg-vn-surface2 first:rounded-t-lg first:border-t first:border-vn-border last:rounded-b-lg last:border-b sm:px-6 sm:py-5"
              >
                <div>
                  <h4 class="mb-1 font-mono text-sm font-medium text-vn-white sm:text-base">{{ role.title }}</h4>
                  <p class="font-mono text-xs text-vn-muted">{{ role.location }}</p>
                </div>
                <span class="shrink-0 rounded border px-2 py-1 font-mono text-xs" :class="role.badgeClass">
                  {{ role.badge }}
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Contact Section -->
    <section id="contact" class="relative overflow-hidden py-20 text-center sm:py-28">
      <!-- Background rings -->
      <div class="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-vn-accent4/5"></div>
      <div class="pointer-events-none absolute left-1/2 top-1/2 h-[900px] w-[900px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-vn-accent4/5"></div>

      <div class="vn-container relative z-10">
        <div class="vn-reveal mx-auto max-w-xl">
          <p class="vn-section-tag justify-center">Get in touch</p>
          <h2 class="vn-section-title">
            WORK<br><span class="text-vn-accent">WITH US.</span>
          </h2>
          <p class="mb-8 text-sm leading-relaxed text-vn-text2 sm:text-base">
            Whether you are looking to adopt Volnux, explore partnership opportunities, or just want to learn more about what we are building, we would love to hear from you.
          </p>
          <div class="flex flex-wrap justify-center gap-3">
            <a href="mailto:hello@volnux.ai" class="vn-btn-primary">hello@volnux.ai</a>
            <a href="#" class="vn-btn-outline">Schedule a call</a>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* Custom ticker animation */
@keyframes ticker {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-50%);
  }
}

.animate-ticker {
  animation: ticker 30s linear infinite;
}

/* Scroll reveal animations */
.vn-reveal {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.vn-reveal.on {
  opacity: 1;
  transform: translateY(0);
}

.reveal-stagger > * {
  opacity: 0;
  transform: translateY(14px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.reveal-stagger.on > *:nth-child(1) { opacity: 1; transform: none; transition-delay: 0s; }
.reveal-stagger.on > *:nth-child(2) { opacity: 1; transform: none; transition-delay: 0.07s; }
.reveal-stagger.on > *:nth-child(3) { opacity: 1; transform: none; transition-delay: 0.14s; }
.reveal-stagger.on > *:nth-child(4) { opacity: 1; transform: none; transition-delay: 0.21s; }
.reveal-stagger.on > *:nth-child(5) { opacity: 1; transform: none; transition-delay: 0.28s; }
.reveal-stagger.on > *:nth-child(6) { opacity: 1; transform: none; transition-delay: 0.35s; }
</style>
