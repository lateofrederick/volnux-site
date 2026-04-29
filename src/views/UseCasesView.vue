<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue'

const mainEl = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

// Industry colors mapping
const industryColors: Record<string, string> = {
  finance: '#5eb0ff',
  health: '#45e0a0',
  data: '#ff8a8a',
  ai: '#b794ff',
  ops: '#f0b04a',
  ecom: '#5ee0d0',
  gov: '#d48cff',
  mfg: '#a6d96a',
}

// Industry data with full use cases from original HTML
const industries = [
  {
    id: 'finance',
    num: '01',
    kicker: 'Financial Services',
    title: 'Automation that meets',
    titleEm: 'regulatory standards.',
    desc: 'Financial organisations run on workflows — loan origination, trade settlement, compliance reporting, fraud detection. Volnux gives every workflow an immutable audit trail, readable definition, and checkpoint-capable execution. When regulators ask what happened, the answer is a trace, not an explanation.',
    stats: [
      { value: 'GDPR', label: 'Compliance ready' },
      { value: 'SOC 2', label: 'Audit trail built-in' },
      { value: '4×', label: 'Faster incident response' },
    ],
    bgClass: 'bg-vn-surface',
    cases: [
      {
        tag: 'Lending',
        title: 'Loan Origination Pipeline',
        description: 'Orchestrate the entire loan lifecycle — from application ingestion through credit scoring, document verification, compliance checks, underwriter review, and conditional disbursement — as a single governed Pointy-lang workflow. Every decision is checkpointed, every branch is traceable, and the compliance team can read the workflow definition without engineering support.',
        wide: true,
        code: `<span class="text-vn-comment"># Full loan lifecycle in Pointy-lang</span>
<span class="text-vn-text">IngestApplication</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">ValidateDocuments</span> <span class="text-vn-retry">* 2</span>
  <span class="text-vn-accent2">|-></span> <span class="text-vn-text">CreditScoreCheck</span><span class="text-vn-attr">[node=<span class="text-vn-string">"risk-cluster"</span>]</span>
  <span class="text-vn-accent2">|-></span> <span class="text-vn-text">AMLScreening</span><span class="text-vn-attr">[executor=<span class="text-vn-string">"celery"</span>]</span>
  <span class="text-vn-accent2">||</span> <span class="text-vn-text">Checkpoint</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">UnderwriterReview</span>(
    <span class="text-vn-accent3">approved</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">Disburse</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">NotifyApplicant</span>,
    <span class="text-vn-accent3">rejected</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">LogDecision</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">NotifyApplicant</span>,
    <span class="text-vn-accent3">review</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">EscalateToSenior</span>
  )`,
      },
      {
        tag: 'Risk',
        title: 'Real-time Fraud Detection',
        description: 'Stream transaction events through parallel ML scoring, rule-based checks, and velocity analysis. Fan-out with MAP for concurrent model evaluation, sync at a barrier, and route to block, flag, or approve — all with a complete OTEL trace per transaction.',
        wide: false,
        code: `<span class="text-vn-text">IngestTransaction</span>
  <span class="text-vn-accent2">|-></span> <span class="text-vn-accent3">MAP</span><span class="text-vn-attr">&lt;MLFraudScore&gt;</span>
  <span class="text-vn-accent2">|-></span> <span class="text-vn-text">VelocityCheck</span>
  <span class="text-vn-accent2">||</span> <span class="text-vn-text">Checkpoint</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">Adjudicate</span>(
    <span class="text-vn-accent3">block</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">FreezeAccount</span>,
    <span class="text-vn-accent3">flag</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">AlertAnalyst</span>,
    <span class="text-vn-accent3">pass</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">ProcessPayment</span>
  )`,
      },
      {
        tag: 'Compliance',
        title: 'Regulatory Report Generation',
        description: 'Automate periodic regulatory submissions — GDPR data subject reports, Basel III capital calculations, AML suspicious activity reports — as versioned, auditable workflows that produce the same output on every run and can be replayed from any checkpoint.',
        wide: false,
        code: `<span class="text-vn-accent3">pypi</span><span class="text-vn-attr">:ExtractPositions@v1.2</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">CalculateCapital</span><span class="text-vn-attr">[node=<span class="text-vn-string">"risk-engine"</span>]</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">ValidateThresholds</span> <span class="text-vn-retry">* 3</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">GenerateReport</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">SubmitToRegulator</span>`,
      },
    ],
  },
  {
    id: 'health',
    num: '02',
    kicker: 'Healthcare',
    title: 'Patient data pipelines',
    titleEm: 'built for accountability.',
    desc: 'In healthcare, workflow failures are not technical incidents — they are patient safety events. Volnux brings full checkpoint-and-rehydrate execution, HIPAA-auditable traces, and readable workflow definitions to clinical data pipelines, prior authorisation systems, and patient intake automation.',
    stats: [
      { value: 'HIPAA', label: 'Compliant by design' },
      { value: 'HL7', label: 'FHIR-compatible events' },
      { value: '0×', label: 'Partial state on failure' },
    ],
    bgClass: 'bg-vn-black',
    cases: [
      {
        tag: 'Clinical',
        title: 'Patient Intake Automation',
        description: 'Orchestrate the full patient onboarding process — eligibility verification, insurance pre-authorisation, consent collection, record creation, and appointment scheduling — as a single traceable workflow with conditional routing on eligibility outcome.',
        wide: false,
        code: `<span class="text-vn-text">CollectDemographics</span>
  <span class="text-vn-accent2">|-></span> <span class="text-vn-text">VerifyInsurance</span> <span class="text-vn-retry">* 3</span>
  <span class="text-vn-accent2">|-></span> <span class="text-vn-text">CollectConsent</span>
  <span class="text-vn-accent2">||</span> <span class="text-vn-text">Checkpoint</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">EligibilityDecision</span>(
    <span class="text-vn-accent3">eligible</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">CreateRecord</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">Schedule</span>,
    <span class="text-vn-accent3">ineligible</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">NotifyPatient</span>
  )`,
      },
      {
        tag: 'Data Pipelines',
        title: 'Clinical Trial Data Processing',
        description: 'Ingest trial data from multiple sites, validate against protocol schemas, run anonymisation, and load to the analysis warehouse — with a complete audit trail for FDA submission and version-pinned EventBase components for reproducibility.',
        wide: false,
        code: `<span class="text-vn-accent3">hub</span><span class="text-vn-attr">:HL7Ingest@v2.1</span>
  <span class="text-vn-accent2">|-></span> <span class="text-vn-accent3">MAP</span><span class="text-vn-attr">&lt;ValidateProtocol&gt;</span> <span class="text-vn-accent2">||</span> <span class="text-vn-text">Checkpoint</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">Anonymise</span><span class="text-vn-attr">[node=<span class="text-vn-string">"secure-enclave"</span>]</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-accent3">hub</span><span class="text-vn-attr">:WarehouseLoad@v1.0</span>`,
      },
      {
        tag: 'Authorisation',
        title: 'Prior Authorisation Workflow',
        description: 'Automate the prior authorisation process — clinical criteria evaluation, payer API submission, decision tracking, appeal routing, and provider notification — with full traceability and escalation on timeout or denial.',
        wide: false,
        code: `<span class="text-vn-text">EvaluateCriteria</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">SubmitToPayer</span> <span class="text-vn-retry">* 3</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">PayerDecision</span>(
    <span class="text-vn-accent3">approved</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">NotifyProvider</span>,
    <span class="text-vn-accent3">denied</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">RouteAppeal</span> <span class="text-vn-retry">* 2</span>,
    <span class="text-vn-accent3">timeout</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">EscalateToTeam</span>
  )`,
      },
      {
        tag: 'AI-assisted',
        title: 'AI-assisted Diagnosis Support',
        description: 'Process imaging results and patient history through AI diagnostic models with checkpoint-across-inference, retry on model timeout, mandatory clinician review routing, and complete OTEL tracing of every model call for audit.',
        wide: false,
        code: `<span class="text-vn-text">IngestImagingData</span>
  <span class="text-vn-accent2">|-></span> <span class="text-vn-text">AIModelScore</span><span class="text-vn-attr">[node=<span class="text-vn-string">"gpu-cluster"</span>]</span> <span class="text-vn-retry">* 2</span>
  <span class="text-vn-accent2">|-></span> <span class="text-vn-text">ExtractPatientHistory</span>
  <span class="text-vn-accent2">||</span> <span class="text-vn-text">Checkpoint</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">ClinicalReview</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">UpdateRecord</span>`,
      },
    ],
  },
  {
    id: 'data',
    num: '03',
    kicker: 'Data Engineering',
    title: 'Pipelines built for',
    titleEm: 'production trust.',
    desc: 'Data pipelines are the connective tissue of every data-driven organisation. Volnux brings readable workflow definitions, version-pinned connectors from EventHub, adaptive streaming for high-volume batches, and full lineage tracing to every ETL, ELT, and streaming pipeline you build.',
    stats: [
      { value: '∞', label: 'Scale without rewrite' },
      { value: 'P2P', label: 'No central scheduler' },
      { value: 'OTEL', label: 'Full lineage tracing' },
    ],
    bgClass: 'bg-vn-surface',
    cases: [
      {
        tag: 'ETL',
        title: 'Postgres to Snowflake with Parallel Validation',
        description: 'The canonical enterprise ETL pipeline — but governable, readable, and reproducible. Pull versioned connectors from EventHub by name, fan out validation across Celery workers, checkpoint before loading, and route validation failures to a quarantine path rather than silently failing the whole pipeline.',
        wide: true,
        code: `<span class="text-vn-accent3">pypi</span><span class="text-vn-attr">:PostgresExtract@v2.4.1</span><span class="text-vn-attr">[node=<span class="text-vn-string">"data-warehouse"</span>]</span>
  <span class="text-vn-accent2">|-></span> <span class="text-vn-accent3">MAP</span><span class="text-vn-attr">&lt;SchemaValidate&gt;</span><span class="text-vn-attr">[executor=<span class="text-vn-string">"celery"</span>]</span>
  <span class="text-vn-accent2">||</span> <span class="text-vn-text">Checkpoint</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">NormaliseTimestamps</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">Process</span>(
    <span class="text-vn-accent3">valid</span> <span class="text-vn-accent">-></span> <span class="text-vn-accent3">hub</span><span class="text-vn-attr">:SnowflakeLoad@v1.0.4</span>,
    <span class="text-vn-accent3">invalid</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">Quarantine</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">AlertDataTeam</span>
  )`,
      },
      {
        tag: 'Streaming',
        title: 'Kafka Streaming Pipeline',
        description: 'Consume Kafka events, validate schema, enrich with lookup data, aggregate into windows, and sink to your destination — with adaptive backpressure management, dead-letter routing for malformed events, and checkpointing for exactly-once semantics.',
        wide: false,
        code: `<span class="text-vn-accent3">pypi</span><span class="text-vn-attr">:KafkaIngest@v1.3</span>
  <span class="text-vn-accent2">|-></span> <span class="text-vn-accent3">MAP</span><span class="text-vn-attr">&lt;ValidateEvent&gt;</span> <span class="text-vn-accent2">||</span> <span class="text-vn-text">Checkpoint</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">Enrich</span><span class="text-vn-attr">[executor=<span class="text-vn-string">"celery"</span>]</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">Aggregate</span> <span class="text-vn-accent">-></span> <span class="text-vn-accent3">hub</span><span class="text-vn-attr">:ClickhouseSink@v1.0</span>`,
      },
      {
        tag: 'ML Features',
        title: 'ML Feature Engineering Pipeline',
        description: 'Compute features from raw event data for model training — windowed aggregations, join enrichment, feature normalisation, and feature store writes — with version-pinned transformers for reproducible training datasets across model generations.',
        wide: false,
        code: `<span class="text-vn-accent3">hub</span><span class="text-vn-attr">:EventExtract@v2.0</span>
  <span class="text-vn-accent2">|-></span> <span class="text-vn-text">WindowAggregate</span><span class="text-vn-attr">[node=<span class="text-vn-string">"compute-cluster"</span>]</span>
  <span class="text-vn-accent2">|-></span> <span class="text-vn-text">JoinEnrichment</span>
  <span class="text-vn-accent2">||</span> <span class="text-vn-text">Checkpoint</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">NormaliseFeatures</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-accent3">hub</span><span class="text-vn-attr">:FeatureStoreWrite@v1.2</span>`,
      },
    ],
  },
  {
    id: 'ai',
    num: '04',
    kicker: 'AI & Machine Learning',
    title: 'The execution substrate',
    titleEm: 'for the age of agents.',
    desc: 'AI systems make consequential decisions at machine speed. They need an execution substrate that checkpoints across LLM calls, traces every model invocation, routes on intent, and provides governance evidence for every automated decision. Volnux was built for this world.',
    stats: [
      { value: '∞', label: 'Agent fan-out with MAP' },
      { value: '100%', label: 'Decisions auditable' },
      { value: '0', label: 'Custom infra required' },
    ],
    bgClass: 'bg-vn-black',
    cases: [
      {
        tag: 'Multi-agent',
        title: 'Multi-agent Customer Support Pipeline',
        description: 'Route inbound customer queries through a multi-agent pipeline — intent classification, context retrieval, specialised agent execution, response quality evaluation, and human escalation — with checkpoint-across-inference so no work is lost if an LLM call times out, and a full OTEL trace for every conversation turn.',
        wide: true,
        code: `<span class="text-vn-text">IngestQuery</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">ClassifyIntent</span><span class="text-vn-attr">[node=<span class="text-vn-string">"gpu-cluster"</span>]</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">RouteIntent</span>(
    <span class="text-vn-accent3">billing</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">BillingAgent</span> <span class="text-vn-retry">* 2</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">Respond</span>,
    <span class="text-vn-accent3">technical</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">TechAgent</span> <span class="text-vn-retry">* 2</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">Respond</span>,
    <span class="text-vn-accent3">complaint</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">EscalateHuman</span>
  )
  <span class="text-vn-accent">-></span> <span class="text-vn-text">EvaluateQuality</span> <span class="text-vn-accent">-></span> <span class="text-vn-text">LogInteraction</span>`,
      },
      {
        tag: 'RAG',
        title: 'RAG Pipeline Orchestration',
        description: 'Orchestrate retrieval-augmented generation end-to-end — query understanding, parallel retrieval from multiple sources, context reranking, LLM generation, and citation extraction — with retries on any LLM call and complete source traceability.',
        wide: false,
        code: `<span class="text-vn-text">IngestQuery</span>
  <span class="text-vn-accent2">|-></span> <span class="text-vn-accent3">MAP</span><span class="text-vn-attr">&lt;RetrieveContext&gt;</span>
  <span class="text-vn-accent2">|-></span> <span class="text-vn-text">Rerank</span>
  <span class="text-vn-accent2">||</span> <span class="text-vn-text">Checkpoint</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">Generate</span><span class="text-vn-attr">[node=<span class="text-vn-string">"llm-cluster"</span>]</span> <span class="text-vn-retry">* 3</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">ExtractCitations</span>`,
      },
      {
        tag: 'Evaluation',
        title: 'LLM Evaluation Pipeline',
        description: 'Run systematic evaluation of LLM outputs against ground-truth datasets with parallel inference, statistical aggregation, and automated regression detection. Version your evaluation logic alongside your prompts for reproducible model comparison.',
        wide: false,
        code: `<span class="text-vn-text">LoadEvalDataset</span> <span class="text-vn-accent2">|-></span> <span class="text-vn-accent3">MAP</span><span class="text-vn-attr">&lt;RunInference&gt;</span>
  <span class="text-vn-accent2">||</span> <span class="text-vn-text">Checkpoint</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">ScoreOutputs</span><span class="text-vn-attr">[executor=<span class="text-vn-string">"celery"</span>]</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">AggregateMetrics</span>
  <span class="text-vn-accent">-></span> <span class="text-vn-text">CompareToBaseline</span>`,
      },
    ],
  },
]

const industryIndex = [
  { id: 'finance', label: 'Financial Services', count: '3 cases' },
  { id: 'health', label: 'Healthcare', count: '4 cases' },
  { id: 'data', label: 'Data Engineering', count: '3 cases' },
  { id: 'ai', label: 'AI & Machine Learning', count: '3 cases' },
]

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth' })
  }
}

function getIndustryColor(id: string): string {
  return industryColors[id] || '#00e5ff'
}

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
    { threshold: 0.1 },
  )

  el.querySelectorAll<HTMLElement>('.vn-reveal, .reveal-stagger').forEach((node) => {
    observer?.observe(node)
  })
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
<main ref="mainEl" class="relative z-10">
<!-- Hero Section -->
<section id="hero" class="relative min-h-screen border-b-2 border-vn-border pt-20">
<div class="vn-container">
<div class="grid grid-cols-1 items-end gap-0 lg:grid-cols-[1.2fr_1fr]">
<!-- Left side -->
<div class="pb-12 pr-0 lg:pb-16 lg:pr-12">
<p class="vn-section-tag mb-6">Volnux across industries</p>
<h1 class="mb-6 font-display text-3xl font-bold leading-tight tracking-tight text-vn-white sm:text-4xl md:text-5xl lg:text-6xl">
Workflows that run<br />
the world's most<br />
<span class="italic" :style="{ color: getIndustryColor('data') }">critical processes.</span>
</h1>
<p class="mb-8 max-w-lg text-base leading-relaxed text-vn-text2 sm:text-lg">
From loan originations to AI agent pipelines, from clinical data processing to real-time retail fulfilment — Volnux's workflow engine provides the same readable, auditable, and governable execution substrate across every industry that depends on automated processes.
</p>

<!-- Stats -->
<div class="flex flex-nowrap gap-0 border-t border-vn-border pt-6">
<div class="border-r border-vn-border pr-6 sm:pr-8">
<div class="font-display text-3xl font-bold text-vn-white sm:text-4xl">
8<span :style="{ color: getIndustryColor('data') }">+</span>
</div>
<div class="mt-1 font-mono text-xs uppercase tracking-wider text-vn-muted">Industries covered</div>
</div>
<div class="border-r border-vn-border px-6 sm:px-8">
<div class="font-display text-3xl font-bold text-vn-white sm:text-4xl">
30<span :style="{ color: getIndustryColor('data') }">+</span>
</div>
<div class="mt-1 font-mono text-xs uppercase tracking-wider text-vn-muted">Workflow use cases</div>
</div>
<div class="pl-6 sm:pl-8">
<div class="font-display text-3xl font-bold text-vn-white sm:text-4xl">1</div>
<div class="mt-1 font-mono text-xs uppercase tracking-wider text-vn-muted">Engine for all of them</div>
</div>
</div>
</div>

<!-- Right side - Industry Index -->
<div class="hidden border-l border-vn-border pb-12 pl-16 pt-8 lg:block lg:pb-16">
<p class="mb-4 border-b border-vn-border pb-3 font-mono text-xs uppercase tracking-wider text-vn-muted">Industry index</p>
<ul class="flex flex-col">
<li
v-for="item in industryIndex"
:key="item.id"
class="group flex cursor-pointer items-center justify-between border-b border-vn-border py-3 transition-all duration-150 hover:pl-2"
@click="scrollToSection(item.id)"
>
<div class="flex items-center gap-3">
<div
class="h-2 w-2 shrink-0 rounded-full"
:style="{ backgroundColor: getIndustryColor(item.id) }"
></div>
<span class="text-sm text-vn-text2 transition-colors duration-150 group-hover:text-vn-text">{{ item.label }}</span>
</div>
<span class="font-mono text-xs text-vn-muted">{{ item.count }}</span>
</li>
</ul>
</div>
</div>
</div>
</section>

    <!-- Industry Sections -->
    <section
      v-for="ind in industries"
      :key="ind.id"
      :id="ind.id"
      class="border-b border-vn-border"
      :class="ind.bgClass"
    >
      <!-- Header -->
      <div class="border-b border-vn-border">
        <div class="vn-container py-12 sm:py-16">
          <div class="vn-reveal grid grid-cols-1 items-start gap-6 sm:grid-cols-[80px_1fr] lg:grid-cols-[80px_1fr_1fr] lg:gap-10">
            <!-- Number -->
            <div
              class="font-display text-5xl font-bold leading-none sm:text-6xl lg:text-7xl"
              :style="{ color: getIndustryColor(ind.id) + '20' }"
            >
              {{ ind.num }}
            </div>

            <!-- Title block -->
            <div>
              <p
                class="mb-2 flex items-center gap-2 font-mono text-xs uppercase tracking-wider"
                :style="{ color: getIndustryColor(ind.id) }"
              >
                <span class="h-px w-4" :style="{ backgroundColor: getIndustryColor(ind.id) }"></span>
                {{ ind.kicker }}
              </p>
              <h2 class="mb-4 font-display text-2xl font-bold leading-tight tracking-tight text-vn-white sm:text-3xl lg:text-4xl">
                {{ ind.title }}<br />
                <em :style="{ color: getIndustryColor(ind.id) }">{{ ind.titleEm }}</em>
              </h2>
              <p class="max-w-md text-sm leading-relaxed text-vn-text2 sm:text-base">
                {{ ind.desc }}
              </p>
            </div>

            <!-- Stats -->
            <div class="flex flex-col gap-4 border-l border-vn-border pl-0 pt-4 sm:pl-8 lg:pl-10 lg:pt-0">
              <div v-for="(stat, i) in ind.stats" :key="i">
                <div class="font-display text-2xl font-bold text-vn-white sm:text-3xl">{{ stat.value }}</div>
                <div class="font-mono text-xs uppercase tracking-wider text-vn-muted">{{ stat.label }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cases Grid -->
      <div class="vn-container py-8 sm:py-12">
        <div class="reveal-stagger grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-vn-border bg-vn-border sm:grid-cols-2">
          <div
            v-for="(caseItem, i) in ind.cases"
            :key="i"
            class="vn-card"
            :class="caseItem.wide ? 'sm:col-span-2' : ''"
          >
            <div class="mb-3">
              <span
                class="inline-block rounded border px-2 py-1 font-mono text-xs uppercase tracking-wider"
                :style="{
                  borderColor: getIndustryColor(ind.id) + '40',
                  color: getIndustryColor(ind.id),
                  backgroundColor: getIndustryColor(ind.id) + '10'
                }"
              >
                {{ caseItem.tag }}
              </span>
            </div>
            <h3 class="mb-3 font-display text-lg font-bold tracking-tight text-vn-white sm:text-xl">{{ caseItem.title }}</h3>
            <p class="mb-5 text-sm leading-relaxed text-vn-muted">{{ caseItem.description }}</p>

            <!-- Code block -->
            <div class="vn-code-block">
              <div class="mb-2 flex items-center gap-2 border-b border-vn-border pb-2">
                <span class="h-2.5 w-2.5 rounded-full bg-red-500"></span>
                <span class="h-2.5 w-2.5 rounded-full bg-yellow-500"></span>
                <span class="h-2.5 w-2.5 rounded-full bg-green-500"></span>
                <span class="ml-auto font-mono text-xs text-vn-muted">{{ ind.id }}_{{ caseItem.tag.toLowerCase().replace(/\s+/g, '_') }}.pointy</span>
              </div>
              <div class="whitespace-pre-wrap font-mono text-xs leading-relaxed" v-html="caseItem.code"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Cross-industry banner -->
    <section id="cross" class="relative overflow-hidden border-b border-vn-border bg-vn-surface2 py-16 sm:py-24">
      <!-- Background text -->
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <span class="font-display text-[6rem] font-bold italic tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.04)] sm:text-[8rem] lg:text-[12rem]">
          ANY WORKFLOW
        </span>
      </div>

      <div class="vn-container relative z-10">
        <div class="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div class="vn-reveal">
            <p class="vn-section-tag">Any workflow</p>
            <h2 class="mb-6 font-display text-3xl font-bold leading-tight tracking-tight text-vn-white sm:text-4xl lg:text-5xl">
              One engine.<br />
              <span class="text-vn-text2">Every use case.</span>
            </h2>
            <p class="text-sm leading-relaxed text-vn-text2 sm:text-base">
              Volnux is not industry-specific. It is a general-purpose workflow engine that happens to excel at the workflows that matter most — the ones that run the world.
            </p>
          </div>

          <div class="vn-reveal flex flex-col">
            <div
              v-for="(feature, i) in [
                'Readable by non-engineers',
                'Checkpointable at every step',
                'Auditable by default',
                'Versioned components',
                'Decentralised execution'
              ]"
              :key="i"
              class="flex items-center gap-3 border-b border-vn-border py-4 first:border-t"
            >
              <div class="h-1.5 w-1.5 shrink-0 rounded-full bg-vn-border2"></div>
              <span class="text-sm text-vn-text2">{{ feature }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA Section -->
    <section class="py-20 text-center sm:py-28">
      <div class="vn-container">
        <div class="vn-reveal mx-auto max-w-2xl">
          <p class="vn-section-tag justify-center">Get started</p>
          <h2 class="mb-6 font-display text-3xl font-bold leading-tight tracking-tight text-vn-white sm:text-4xl lg:text-5xl">
            Ready to build<br />
            <span class="italic text-vn-accent">governable</span> workflows?
          </h2>
          <p class="mb-8 text-sm leading-relaxed text-vn-text2 sm:text-base">
            Join early adopters who are already running production workflows on Volnux. Get access to the platform, documentation, and our community of workflow engineers.
          </p>
          <div class="flex flex-wrap justify-center gap-3">
            <a href="/" class="vn-btn-primary">Get Early Access</a>
            <a href="/docs" class="vn-btn-outline">Read the Docs</a>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
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
.reveal-stagger.on > *:nth-child(2) { opacity: 1; transform: none; transition-delay: 0.08s; }
.reveal-stagger.on > *:nth-child(3) { opacity: 1; transform: none; transition-delay: 0.16s; }
.reveal-stagger.on > *:nth-child(4) { opacity: 1; transform: none; transition-delay: 0.24s; }
</style>
