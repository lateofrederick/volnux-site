<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue'
import { useTheme } from '@/composables/useTheme'

const { isDark } = useTheme()

const mainEl = ref<HTMLElement | null>(null)
const heroRef = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | null = null

const mouseX = ref(0)
const mouseY = ref(0)

const spotlightStyle = computed(() => {
  const color = isDark.value ? '99, 102, 241' : '67, 56, 202'
  const opacity = isDark.value ? '0.12' : '0.16'
  const size = isDark.value ? '900px' : '700px'
  return {
    background: `radial-gradient(${size} circle at ${mouseX.value}px ${mouseY.value}px, rgba(${color}, ${opacity}), rgba(${color}, ${isDark.value ? '0.04' : '0.06'}) 40%, transparent 70%)`,
  }
})

function handleMouseMove(e: MouseEvent) {
  if (!heroRef.value) return
  const rect = heroRef.value.getBoundingClientRect()
  mouseX.value = e.clientX - rect.left
  mouseY.value = e.clientY - rect.top
}

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
      { value: '4\u00d7', label: 'Faster incident response' },
    ],
    cases: [
      {
        tag: 'Lending',
        title: 'Loan Origination Pipeline',
        description: 'Orchestrate the entire loan lifecycle — from application ingestion through credit scoring, document verification, compliance checks, underwriter review, and conditional disbursement — as a single governed Pointy-lang workflow. Every decision is checkpointed, every branch is traceable, and the compliance team can read the workflow definition without engineering support.',
        wide: true,
        code: `<span class="text-slate-500"># Full loan lifecycle in Pointy-lang</span>
<span class="text-indigo-400">IngestApplication</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ValidateDocuments</span> <span class="text-amber-400">* 2</span>
<span class="text-violet-400">|-></span> <span class="text-indigo-400">CreditScoreCheck</span><span class="text-amber-300">[node=<span class="text-rose-400">"risk-cluster"</span>]</span>
<span class="text-violet-400">|-></span> <span class="text-indigo-400">AMLScreening</span><span class="text-amber-300">[executor=<span class="text-rose-400">"celery"</span>]</span>
<span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">UnderwriterReview</span><span class="text-slate-300">(</span>
<span class="text-emerald-400">approved</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">Disburse</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">NotifyApplicant</span><span class="text-slate-300">,</span>
<span class="text-rose-400">rejected</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">LogDecision</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">NotifyApplicant</span><span class="text-slate-300">,</span>
<span class="text-emerald-400">review</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">EscalateToSenior</span>
<span class="text-slate-300">)</span>`,
      },
      {
        tag: 'Risk',
        title: 'Real-time Fraud Detection',
        description: 'Stream transaction events through parallel ML scoring, rule-based checks, and velocity analysis. Fan-out with MAP for concurrent model evaluation, sync at a barrier, and route to block, flag, or approve — all with a complete OTEL trace per transaction.',
        wide: false,
        code: `<span class="text-indigo-400">IngestTransaction</span>
<span class="text-violet-400">|-></span> <span class="text-emerald-400">MAP</span><span class="text-amber-300">&lt;MLFraudScore&gt;</span>
<span class="text-violet-400">|-></span> <span class="text-indigo-400">VelocityCheck</span>
<span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">Adjudicate</span><span class="text-slate-300">(</span>
<span class="text-rose-400">block</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">FreezeAccount</span><span class="text-slate-300">,</span>
<span class="text-amber-400">flag</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">AlertAnalyst</span><span class="text-slate-300">,</span>
<span class="text-emerald-400">pass</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ProcessPayment</span>
<span class="text-slate-300">)</span>`,
      },
      {
        tag: 'Compliance',
        title: 'Regulatory Report Generation',
        description: 'Automate periodic regulatory submissions — GDPR data subject reports, Basel III capital calculations, AML suspicious activity reports — as versioned, auditable workflows that produce the same output on every run and can be replayed from any checkpoint.',
        wide: false,
        code: `<span class="text-emerald-300">pypi</span><span class="text-amber-300">:ExtractPositions@v1.2</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">CalculateCapital</span><span class="text-amber-300">[node=<span class="text-rose-400">"risk-engine"</span>]</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">ValidateThresholds</span> <span class="text-amber-400">* 3</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">GenerateReport</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">SubmitToRegulator</span>`,
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
      { value: '0\u00d7', label: 'Partial state on failure' },
    ],
    cases: [
      {
        tag: 'Clinical',
        title: 'Patient Intake Automation',
        description: 'Orchestrate the full patient onboarding process — eligibility verification, insurance pre-authorisation, consent collection, record creation, and appointment scheduling — as a single traceable workflow with conditional routing on eligibility outcome.',
        wide: false,
        code: `<span class="text-indigo-400">CollectDemographics</span>
<span class="text-violet-400">|-></span> <span class="text-indigo-400">VerifyInsurance</span> <span class="text-amber-400">* 3</span>
<span class="text-violet-400">|-></span> <span class="text-indigo-400">CollectConsent</span>
<span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">EligibilityDecision</span><span class="text-slate-300">(</span>
<span class="text-emerald-400">eligible</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">CreateRecord</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">Schedule</span><span class="text-slate-300">,</span>
<span class="text-rose-400">ineligible</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">NotifyPatient</span>
<span class="text-slate-300">)</span>`,
      },
      {
        tag: 'Data Pipelines',
        title: 'Clinical Trial Data Processing',
        description: 'Ingest trial data from multiple sites, validate against protocol schemas, run anonymisation, and load to the analysis warehouse — with a complete audit trail for FDA submission and version-pinned EventBase components for reproducibility.',
        wide: false,
        code: `<span class="text-emerald-300">hub</span><span class="text-amber-300">:HL7Ingest@v2.1</span>
<span class="text-violet-400">|-></span> <span class="text-emerald-400">MAP</span><span class="text-amber-300">&lt;ValidateProtocol&gt;</span> <span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">Anonymise</span><span class="text-amber-300">[node=<span class="text-rose-400">"secure-enclave"</span>]</span>
<span class="text-violet-400">-></span> <span class="text-emerald-300">hub</span><span class="text-amber-300">:WarehouseLoad@v1.0</span>`,
      },
      {
        tag: 'Authorisation',
        title: 'Prior Authorisation Workflow',
        description: 'Automate the prior authorisation process — clinical criteria evaluation, payer API submission, decision tracking, appeal routing, and provider notification — with full traceability and escalation on timeout or denial.',
        wide: false,
        code: `<span class="text-indigo-400">EvaluateCriteria</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">SubmitToPayer</span> <span class="text-amber-400">* 3</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">PayerDecision</span><span class="text-slate-300">(</span>
<span class="text-emerald-400">approved</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">NotifyProvider</span><span class="text-slate-300">,</span>
<span class="text-rose-400">denied</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">RouteAppeal</span> <span class="text-amber-400">* 2</span><span class="text-slate-300">,</span>
<span class="text-amber-400">timeout</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">EscalateToTeam</span>
<span class="text-slate-300">)</span>`,
      },
      {
        tag: 'AI-assisted',
        title: 'AI-assisted Diagnosis Support',
        description: 'Process imaging results and patient history through AI diagnostic models with checkpoint-across-inference, retry on model timeout, mandatory clinician review routing, and complete OTEL tracing of every model call for audit.',
        wide: false,
        code: `<span class="text-indigo-400">IngestImagingData</span>
<span class="text-violet-400">|-></span> <span class="text-indigo-400">AIModelScore</span><span class="text-amber-300">[node=<span class="text-rose-400">"gpu-cluster"</span>]</span> <span class="text-amber-400">* 2</span>
<span class="text-violet-400">|-></span> <span class="text-indigo-400">ExtractPatientHistory</span>
<span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">ClinicalReview</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">UpdateRecord</span>`,
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
      { value: '\u221e', label: 'Scale without rewrite' },
      { value: 'P2P', label: 'No central scheduler' },
      { value: 'OTEL', label: 'Full lineage tracing' },
    ],
    cases: [
      {
        tag: 'ETL',
        title: 'Postgres to Snowflake with Parallel Validation',
        description: 'The canonical enterprise ETL pipeline — but governable, readable, and reproducible. Pull versioned connectors from EventHub by name, fan out validation across Celery workers, checkpoint before loading, and route validation failures to a quarantine path rather than silently failing the whole pipeline.',
        wide: true,
        code: `<span class="text-emerald-300">pypi</span><span class="text-amber-300">:PostgresExtract@v2.4.1</span><span class="text-amber-300">[node=<span class="text-rose-400">"data-warehouse"</span>]</span>
<span class="text-violet-400">|-></span> <span class="text-emerald-400">MAP</span><span class="text-amber-300">&lt;SchemaValidate&gt;</span><span class="text-amber-300">[executor=<span class="text-rose-400">"celery"</span>]</span>
<span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">NormaliseTimestamps</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">Process</span><span class="text-slate-300">(</span>
<span class="text-emerald-400">valid</span> <span class="text-violet-400">-></span> <span class="text-emerald-300">hub</span><span class="text-amber-300">:SnowflakeLoad@v1.0.4</span><span class="text-slate-300">,</span>
<span class="text-rose-400">invalid</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">Quarantine</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">AlertDataTeam</span>
<span class="text-slate-300">)</span>`,
      },
      {
        tag: 'Streaming',
        title: 'Kafka Streaming Pipeline',
        description: 'Consume Kafka events, validate schema, enrich with lookup data, aggregate into windows, and sink to your destination — with adaptive backpressure management, dead-letter routing for malformed events, and checkpointing for exactly-once semantics.',
        wide: false,
        code: `<span class="text-emerald-300">pypi</span><span class="text-amber-300">:KafkaIngest@v1.3</span>
<span class="text-violet-400">|-></span> <span class="text-emerald-400">MAP</span><span class="text-amber-300">&lt;ValidateEvent&gt;</span> <span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">Enrich</span><span class="text-amber-300">[executor=<span class="text-rose-400">"celery"</span>]</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">Aggregate</span> <span class="text-violet-400">-></span> <span class="text-emerald-300">hub</span><span class="text-amber-300">:ClickhouseSink@v1.0</span>`,
      },
      {
        tag: 'ML Features',
        title: 'ML Feature Engineering Pipeline',
        description: 'Compute features from raw event data for model training — windowed aggregations, join enrichment, feature normalisation, and feature store writes — with version-pinned transformers for reproducible training datasets across model generations.',
        wide: false,
        code: `<span class="text-emerald-300">hub</span><span class="text-amber-300">:EventExtract@v2.0</span>
<span class="text-violet-400">|-></span> <span class="text-indigo-400">WindowAggregate</span><span class="text-amber-300">[node=<span class="text-rose-400">"compute-cluster"</span>]</span>
<span class="text-violet-400">|-></span> <span class="text-indigo-400">JoinEnrichment</span>
<span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">NormaliseFeatures</span>
<span class="text-violet-400">-></span> <span class="text-emerald-300">hub</span><span class="text-amber-300">:FeatureStoreWrite@v1.2</span>`,
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
      { value: '\u221e', label: 'Agent fan-out with MAP' },
      { value: '100%', label: 'Decisions auditable' },
      { value: '0', label: 'Custom infra required' },
    ],
    cases: [
      {
        tag: 'Multi-agent',
        title: 'Multi-agent Customer Support Pipeline',
        description: 'Route inbound customer queries through a multi-agent pipeline — intent classification, context retrieval, specialised agent execution, response quality evaluation, and human escalation — with checkpoint-across-inference so no work is lost if an LLM call times out, and a full OTEL trace for every conversation turn.',
        wide: true,
        code: `<span class="text-indigo-400">IngestQuery</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ClassifyIntent</span><span class="text-amber-300">[node=<span class="text-rose-400">"gpu-cluster"</span>]</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">RouteIntent</span><span class="text-slate-300">(</span>
<span class="text-emerald-400">billing</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">BillingAgent</span> <span class="text-amber-400">* 2</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">Respond</span><span class="text-slate-300">,</span>
<span class="text-emerald-400">technical</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">TechAgent</span> <span class="text-amber-400">* 2</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">Respond</span><span class="text-slate-300">,</span>
<span class="text-rose-400">complaint</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">EscalateHuman</span>
<span class="text-slate-300">)</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">EvaluateQuality</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">LogInteraction</span>`,
      },
      {
        tag: 'RAG',
        title: 'RAG Pipeline Orchestration',
        description: 'Orchestrate retrieval-augmented generation end-to-end — query understanding, parallel retrieval from multiple sources, context reranking, LLM generation, and citation extraction — with retries on any LLM call and complete source traceability.',
        wide: false,
        code: `<span class="text-indigo-400">IngestQuery</span>
<span class="text-violet-400">|-></span> <span class="text-emerald-400">MAP</span><span class="text-amber-300">&lt;RetrieveContext&gt;</span>
<span class="text-violet-400">|-></span> <span class="text-indigo-400">Rerank</span>
<span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">Generate</span><span class="text-amber-300">[node=<span class="text-rose-400">"llm-cluster"</span>]</span> <span class="text-amber-400">* 3</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">ExtractCitations</span>`,
      },
      {
        tag: 'Evaluation',
        title: 'LLM Evaluation Pipeline',
        description: 'Run systematic evaluation of LLM outputs against ground-truth datasets with parallel inference, statistical aggregation, and automated regression detection. Version your evaluation logic alongside your prompts for reproducible model comparison.',
        wide: false,
        code: `<span class="text-indigo-400">LoadEvalDataset</span> <span class="text-violet-400">|-></span> <span class="text-emerald-400">MAP</span><span class="text-amber-300">&lt;RunInference&gt;</span>
<span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">ScoreOutputs</span><span class="text-amber-300">[executor=<span class="text-rose-400">"celery"</span>]</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">AggregateMetrics</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">CompareToBaseline</span>`,
      },
    ],
  },
  {
    id: 'ops',
    num: '05',
    kicker: 'Enterprise Operations',
    title: 'Business processes that',
    titleEm: 'anyone can audit.',
    desc: 'Approval workflows, provisioning pipelines, change management processes — the operational backbone of the enterprise. Volnux makes these processes readable by everyone with a stake in them and governable by the teams responsible for them, without requiring engineering involvement to understand what runs.',
    stats: [
      { value: '0', label: 'Lines of extra governance code' },
      { value: 'Any', label: 'Stakeholder can read it' },
    ],
    cases: [
      {
        tag: 'HR',
        title: 'Employee Onboarding Automation',
        description: 'Orchestrate the full employee onboarding sequence — identity provisioning, system access, hardware requests, policy acknowledgements, and manager notifications — as a single readable workflow that HR, IT, and legal can all verify against.',
        wide: false,
        code: `<span class="text-indigo-400">CreateIdentity</span>
<span class="text-violet-400">|-></span> <span class="text-indigo-400">ProvisionSystems</span><span class="text-amber-300">[executor=<span class="text-rose-400">"celery"</span>]</span>
<span class="text-violet-400">|-></span> <span class="text-indigo-400">RequestHardware</span>
<span class="text-violet-400">|-></span> <span class="text-indigo-400">SendPolicyDocs</span>
<span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">NotifyManager</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ScheduleOrientation</span>`,
      },
      {
        tag: 'Procurement',
        title: 'Purchase Approval Workflow',
        description: 'Automate purchase request routing through multi-level approval, budget validation, vendor due diligence, and PO generation — with timeout escalation, conditional routing by amount threshold, and a complete audit trail for finance and compliance review.',
        wide: false,
        code: `<span class="text-indigo-400">SubmitRequest</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ValidateBudget</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">ManagerApproval</span> <span class="text-amber-400">* 2</span><span class="text-slate-300">(</span>
<span class="text-emerald-400">approved</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">VendorCheck</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">GeneratePO</span><span class="text-slate-300">,</span>
<span class="text-rose-400">rejected</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">NotifyRequestor</span><span class="text-slate-300">,</span>
<span class="text-amber-400">timeout</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">EscalateDirector</span>
<span class="text-slate-300">)</span>`,
      },
      {
        tag: 'IT Operations',
        title: 'Infrastructure Provisioning',
        description: 'Automate cloud resource provisioning — security group creation, network configuration, compute spin-up, monitoring setup, and team notification — as a versioned, replayable workflow that can be audited, rolled back, and rerun from any checkpoint on failure.',
        wide: false,
        code: `<span class="text-indigo-400">CreateNetworkConfig</span>
<span class="text-violet-400">|-></span> <span class="text-indigo-400">ProvisionCompute</span><span class="text-amber-300">[node=<span class="text-rose-400">"cloud-east"</span>]</span>
<span class="text-violet-400">|-></span> <span class="text-indigo-400">ConfigureMonitoring</span>
<span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">ValidateHealth</span> <span class="text-amber-400">* 3</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">NotifyTeam</span>`,
      },
      {
        tag: 'Change Management',
        title: 'Software Release Pipeline',
        description: 'Orchestrate the release process from staging to production — automated testing, stakeholder sign-off, change advisory board approval, deployment window scheduling, blue-green rollout, and automatic rollback on health check failure.',
        wide: true,
        code: `<span class="text-indigo-400">RunTestSuite</span><span class="text-amber-300">[executor=<span class="text-rose-400">"celery"</span>]</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">CABApproval</span><span class="text-slate-300">(</span>
<span class="text-emerald-400">approved</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">BlueGreenDeploy</span> <span class="text-amber-400">* 2</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">HealthCheck</span><span class="text-slate-300">(</span>
<span class="text-emerald-400">healthy</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">CutoverTraffic</span><span class="text-slate-300">,</span>
<span class="text-amber-400">degraded</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">Rollback</span>
<span class="text-slate-300">)</span><span class="text-slate-300">,</span>
<span class="text-rose-400">blocked</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">PostponeRelease</span>
<span class="text-slate-300">)</span>`,
      },
    ],
  },
  {
    id: 'ecom',
    num: '06',
    kicker: 'E-commerce & Retail',
    title: 'The operational backbone',
    titleEm: 'of retail at scale.',
    desc: 'Order fulfilment, inventory synchronisation, returns processing, supplier integration — the operational workflows of retail happen at high volume with tight SLA requirements. Volnux\'s adaptive execution handles peak load without rewriting pipelines, and every workflow is replayable on failure without customer impact.',
    stats: [
      { value: 'Auto', label: 'Scales to peak load' },
      { value: '0s', label: 'Work lost on failure' },
    ],
    cases: [
      {
        tag: 'Fulfilment',
        title: 'Order Fulfilment Orchestration',
        description: 'From payment confirmation to dispatch notification — inventory reservation, warehouse pick-and-pack instruction, shipping label generation, carrier handoff, and real-time customer notification — all as a single checkpointed workflow with graceful failure routing.',
        wide: false,
        code: `<span class="text-indigo-400">ConfirmPayment</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ReserveInventory</span> <span class="text-amber-400">* 2</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">InventoryCheck</span><span class="text-slate-300">(</span>
<span class="text-emerald-400">available</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">GeneratePickList</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">CreateShippingLabel</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">HandoffCarrier</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">NotifyCustomer</span><span class="text-slate-300">,</span>
<span class="text-rose-400">out_of_stock</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">NotifyCustomer</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">RefundPayment</span>
<span class="text-slate-300">)</span>`,
      },
      {
        tag: 'Returns',
        title: 'Returns & Refund Processing',
        description: 'Automate the returns lifecycle — return request validation, return label generation, item condition assessment on receipt, restocking or quarantine routing, and refund processing with conditional approval by return reason and item value.',
        wide: false,
        code: `<span class="text-indigo-400">ValidateReturnRequest</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">GenerateReturnLabel</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">AwaitItemReceipt</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">AssessCondition</span><span class="text-slate-300">(</span>
<span class="text-emerald-400">resellable</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">Restock</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ProcessRefund</span><span class="text-slate-300">,</span>
<span class="text-rose-400">damaged</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">Quarantine</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ProcessRefund</span>
<span class="text-slate-300">)</span>`,
      },
      {
        tag: 'Inventory',
        title: 'Multi-channel Inventory Sync',
        description: 'Synchronise inventory levels across multiple sales channels and warehouse systems in real time — extract from each source in parallel, reconcile discrepancies, apply business rules, and publish updates with conflict detection and alerting.',
        wide: false,
        code: `<span class="text-indigo-400">ExtractWMS</span> <span class="text-violet-400">|-></span> <span class="text-indigo-400">ExtractShopify</span> <span class="text-violet-400">|-></span> <span class="text-indigo-400">ExtractERP</span>
<span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">Reconcile</span><span class="text-slate-300">(</span>
<span class="text-emerald-400">aligned</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">PublishUpdates</span><span class="text-slate-300">,</span>
<span class="text-amber-400">discrepancy</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">AlertOpsTeam</span>
<span class="text-slate-300">)</span>`,
      },
      {
        tag: 'Personalisation',
        title: 'AI-driven Product Recommendation',
        description: 'Generate personalised product recommendations — user behaviour extraction, embedding computation, similarity search, business rule application, and A/B assignment — with version-pinned ML components for reproducible recommendation logic.',
        wide: false,
        code: `<span class="text-indigo-400">ExtractBehaviour</span>
<span class="text-violet-400">|-></span> <span class="text-emerald-300">hub</span><span class="text-amber-300">:EmbedDocuments@v0.9</span><span class="text-amber-300">[node=<span class="text-rose-400">"gpu-cluster"</span>]</span>
<span class="text-violet-400">|-></span> <span class="text-indigo-400">VectorSimilarity</span>
<span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">ApplyBusinessRules</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">AssignABVariant</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ServeRecommendations</span>`,
      },
    ],
  },
  {
    id: 'gov',
    num: '07',
    kicker: 'Governance & Compliance',
    title: 'Every decision',
    titleEm: 'explained by design.',
    desc: 'Governance workflows are not just about compliance — they are about maintaining trust in automated systems at scale. Whether it is GDPR data requests, SOC 2 evidence collection, or AI decision audit trails, Volnux provides the execution substrate that makes automated decisions explainable without retrofitting observability after the fact.',
    stats: [
      { value: 'OTEL', label: 'Trace per execution' },
      { value: 'Auto', label: 'Audit trail generation' },
    ],
    cases: [
      {
        tag: 'GDPR',
        title: 'Data Subject Request Pipeline',
        description: 'Automate GDPR data subject access and deletion requests — request validation, identity verification, data discovery across systems, redaction or export generation, and response delivery — with a complete audit trail for each request and configurable SLA enforcement.',
        wide: false,
        code: `<span class="text-indigo-400">ValidateRequest</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">VerifyIdentity</span> <span class="text-amber-400">* 2</span>
<span class="text-violet-400">-></span> <span class="text-emerald-400">MAP</span><span class="text-amber-300">&lt;DiscoverData&gt;</span><span class="text-amber-300">[executor=<span class="text-rose-400">"celery"</span>]</span>
<span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">RequestType</span><span class="text-slate-300">(</span>
<span class="text-emerald-400">access</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ExportData</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">DeliverResponse</span><span class="text-slate-300">,</span>
<span class="text-rose-400">deletion</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">RedactData</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ConfirmDeletion</span>
<span class="text-slate-300">)</span>`,
      },
      {
        tag: 'SOC 2',
        title: 'Automated Evidence Collection',
        description: 'Continuously collect SOC 2 evidence — access log exports, configuration snapshots, change record collection, and policy acknowledgement tracking — as scheduled workflows that produce structured, auditor-ready artifacts automatically rather than on demand under audit pressure.',
        wide: false,
        code: `<span class="text-indigo-400">ExtractAccessLogs</span> <span class="text-violet-400">|-></span> <span class="text-indigo-400">SnapshotConfig</span>
<span class="text-indigo-400">ExtractChangeLogs</span> <span class="text-violet-400">|-></span> <span class="text-indigo-400">PolicyAckStatus</span>
<span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">GenerateEvidencePackage</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">StoreToAuditVault</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">NotifyAuditTeam</span>`,
      },
      {
        tag: 'AI Audit',
        title: 'AI Decision Audit Trail',
        description: 'Generate explainability artifacts for every AI decision in a regulated context — input feature capture, model version recording, decision output logging, confidence threshold checking, and mandatory human review routing when confidence falls below threshold.',
        wide: false,
        code: `<span class="text-indigo-400">CaptureInputFeatures</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">RunModel</span><span class="text-amber-300">[node=<span class="text-rose-400">"gpu-cluster"</span>]</span> <span class="text-amber-400">* 2</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">ConfidenceCheck</span><span class="text-slate-300">(</span>
<span class="text-emerald-400">high</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">LogDecision</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">Apply</span><span class="text-slate-300">,</span>
<span class="text-amber-400">low</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">HumanReview</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">LogDecision</span>
<span class="text-slate-300">)</span>`,
      },
      {
        tag: 'Risk',
        title: 'Third-party Risk Assessment',
        description: 'Automate vendor and third-party risk assessments — questionnaire dispatch and collection, automated scoring, risk classification, escalation to security review for high-risk vendors, and contract flag generation — with complete audit trail for procurement governance.',
        wide: false,
        code: `<span class="text-indigo-400">SendQuestionnaire</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">CollectResponses</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">ScoreRisk</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ClassifyVendor</span><span class="text-slate-300">(</span>
<span class="text-emerald-400">low</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ApproveVendor</span><span class="text-slate-300">,</span>
<span class="text-amber-400">medium</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">RequestMitigation</span><span class="text-slate-300">,</span>
<span class="text-rose-400">high</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">SecurityReview</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">EscalateCISO</span>
<span class="text-slate-300">)</span>`,
      },
    ],
  },
  {
    id: 'mfg',
    num: '08',
    kicker: 'Manufacturing & Logistics',
    title: 'Supply chain workflows',
    titleEm: 'that never lose state.',
    desc: 'Manufacturing and logistics workflows are long-running, stateful, and costly to restart from scratch. Volnux\'s checkpoint-and-rehydrate execution means a workflow that started in a warehouse in Accra can continue on a node in Singapore after a network partition — without losing a single step.',
    stats: [
      { value: 'P2P', label: 'Mesh across sites' },
      { value: 'Auto', label: 'Rehydrate on failure' },
    ],
    cases: [
      {
        tag: 'Supply Chain',
        title: 'Purchase Order to Receipt',
        description: 'Orchestrate the full purchase order lifecycle across supplier and warehouse nodes — PO generation, supplier acknowledgement, shipment tracking, goods receipt, quality inspection, and three-way match for invoice approval — with cross-site mesh dispatch and automatic retry on supplier API failures.',
        wide: false,
        code: `<span class="text-indigo-400">GeneratePO</span><span class="text-amber-300">[node=<span class="text-rose-400">"erp-node"</span>]</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">SendToSupplier</span> <span class="text-amber-400">* 3</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">TrackShipment</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">GoodsReceipt</span><span class="text-amber-300">[node=<span class="text-rose-400">"warehouse-gh"</span>]</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">QualityInspection</span><span class="text-slate-300">(</span>
<span class="text-emerald-400">passed</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ThreeWayMatch</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ApproveInvoice</span><span class="text-slate-300">,</span>
<span class="text-rose-400">rejected</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">RaiseNCR</span>
<span class="text-slate-300">)</span>`,
      },
      {
        tag: 'Quality',
        title: 'Production Quality Control',
        description: 'Automate end-of-line quality control — sensor data collection, statistical process control analysis, AI visual inspection, pass/fail classification, and batch release or quarantine — with parallel data collection from multiple inspection stations and automatic escalation.',
        wide: false,
        code: `<span class="text-indigo-400">CollectSensorData</span> <span class="text-violet-400">|-></span> <span class="text-indigo-400">VisualInspection</span><span class="text-amber-300">[node=<span class="text-rose-400">"gpu-cluster"</span>]</span>
<span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">SPCAnalysis</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ClassifyBatch</span><span class="text-slate-300">(</span>
<span class="text-emerald-400">pass</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ReleaseBatch</span><span class="text-slate-300">,</span>
<span class="text-amber-400">marginal</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ManualReview</span><span class="text-slate-300">,</span>
<span class="text-rose-400">fail</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">QuarantineBatch</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">AlertQE</span>
<span class="text-slate-300">)</span>`,
      },
      {
        tag: 'Logistics',
        title: 'Last-mile Delivery Orchestration',
        description: 'Coordinate last-mile delivery across carrier networks — route optimisation, driver assignment, real-time tracking updates, proof-of-delivery collection, and exception handling for failed deliveries — dispatched across geographic mesh nodes.',
        wide: false,
        code: `<span class="text-indigo-400">OptimiseRoutes</span><span class="text-amber-300">[node=<span class="text-rose-400">"routing-engine"</span>]</span>
<span class="text-violet-400">|-></span> <span class="text-emerald-400">MAP</span><span class="text-amber-300">&lt;AssignDriver&gt;</span> <span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">TrackDelivery</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">DeliveryOutcome</span><span class="text-slate-300">(</span>
<span class="text-emerald-400">delivered</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">CollectPOD</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">NotifyCustomer</span><span class="text-slate-300">,</span>
<span class="text-rose-400">failed</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">ScheduleReattempt</span>
<span class="text-slate-300">)</span>`,
      },
      {
        tag: 'Predictive',
        title: 'Predictive Maintenance Pipeline',
        description: 'Stream IoT sensor data from production equipment, run ML anomaly detection in parallel across equipment classes, classify fault probability, and trigger preventive maintenance work orders before equipment failure — with a complete trace for maintenance record compliance.',
        wide: false,
        code: `<span class="text-emerald-300">hub</span><span class="text-amber-300">:IoTIngest@v1.0</span>
<span class="text-violet-400">|-></span> <span class="text-emerald-400">MAP</span><span class="text-amber-300">&lt;AnomalyDetect&gt;</span><span class="text-amber-300">[executor=<span class="text-rose-400">"celery"</span>]</span>
<span class="text-violet-400">||</span> <span class="text-indigo-400">Checkpoint</span>
<span class="text-violet-400">-></span> <span class="text-indigo-400">ClassifyFaultRisk</span><span class="text-slate-300">(</span>
<span class="text-rose-400">critical</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">CreateWorkOrder</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">AlertMaintenanceMgr</span><span class="text-slate-300">,</span>
<span class="text-amber-400">monitor</span> <span class="text-violet-400">-></span> <span class="text-indigo-400">LogForTrending</span>
<span class="text-slate-300">)</span>`,
      },
    ],
  },
]

const industryIndex = computed(() =>
  industries.map((ind) => ({
    id: ind.id,
    num: ind.num,
    label: ind.kicker,
    count: `${ind.cases.length} cases`,
  })),
)

function scrollToSection(id: string) {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

function getIndustryColor(id: string): string {
  return industryColors[id] || '#6366f1'
}

function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '99, 102, 241'
}

const heroStats = computed(() => [
  { value: `${industries.length}`, label: 'Industries' },
  { value: `${industries.reduce((sum, i) => sum + i.cases.length, 0)}`, label: 'Use cases' },
  { value: '1', label: 'Engine' },
])

const crossFeatures = [
  { title: 'Readable by non-engineers', desc: 'Pointy-lang IS the workflow. What you read is what executes.', icon: '{ }' },
  { title: 'Checkpointable at every step', desc: 'Every execution checkpointed automatically. Rehydrate from any point.', icon: '\u21BB' },
  { title: 'Auditable by default', desc: 'Every state transition traced. Full replay capability built-in.', icon: '\u25CE' },
  { title: 'Versioned components', desc: 'Teams publish to registry. Others consume by name. No shared codebases.', icon: '\u2299' },
  { title: 'Decentralised execution', desc: 'P2P mesh dispatches tasks regardless of industry or geography.', icon: '\u2B21' },
  { title: 'Open core', desc: 'Your workflows are not locked to Volnux infrastructure.', icon: '\u2606' },
]

onMounted(() => {
  const el = mainEl.value
  if (!el) return

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('revealed')
      })
    },
    { threshold: 0.06, rootMargin: '0px 0px -30px 0px' },
  )

  el.querySelectorAll('.reveal, .reveal-stagger').forEach((node) => {
    observer?.observe(node)
  })
})

onUnmounted(() => observer?.disconnect())
</script>

<template>
  <main ref="mainEl" class="relative overflow-x-hidden bg-white transition-colors duration-300 dark:bg-[#0a0a0f]">
    <!-- ============================================
         HERO SECTION
         ============================================ -->
    <section
      ref="heroRef"
      class="relative flex min-h-screen flex-col justify-between overflow-hidden pt-24 sm:pt-32"
      @mousemove="handleMouseMove"
    >
      <!-- Background layers -->
      <div class="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 transition-colors duration-300 dark:from-[#0a0a0f] dark:via-[#12121a] dark:to-[#0f0f16]" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.08),transparent_50%)] transition-colors duration-300 dark:bg-[radial-gradient(ellipse_at_top_right,rgba(99,102,241,0.15),transparent_50%)]" />
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.05),transparent_50%)] transition-colors duration-300 dark:bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.1),transparent_50%)]" />

      <!-- Mouse spotlight -->
      <div class="pointer-events-none absolute inset-0 z-10 transition-opacity duration-300" :style="spotlightStyle" />

      <!-- Animated aurora blobs -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="aurora-blob aurora-blob-1 absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full bg-indigo-400/10 blur-[120px] dark:bg-indigo-500/8" />
        <div class="aurora-blob aurora-blob-2 absolute -right-32 top-1/3 h-[400px] w-[400px] rounded-full bg-violet-400/10 blur-[100px] dark:bg-violet-500/8" />
        <div class="aurora-blob aurora-blob-3 absolute bottom-1/4 left-1/3 h-[350px] w-[350px] rounded-full bg-fuchsia-400/8 blur-[100px] dark:bg-fuchsia-500/6" />
      </div>

      <!-- Grid pattern -->
      <div class="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.03)_1px,transparent_1px)] bg-[size:60px_60px] dark:bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)]" />

      <!-- Content -->
      <div class="relative z-20 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid items-end gap-0 pb-0 lg:grid-cols-[1.4fr_1fr]">
          <!-- Left column -->
          <div class="border-b border-slate-200/80 pb-16 pr-0 dark:border-slate-800/60 lg:border-r lg:pb-20 lg:pr-16">
            <!-- Pill badge -->
            <div class="reveal mb-8 inline-flex items-center gap-2.5 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1.5 backdrop-blur-sm dark:border-indigo-500/20 dark:bg-indigo-500/8">
              <span class="relative flex h-2 w-2">
                <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
                <span class="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
              </span>
              <span class="text-sm font-medium text-indigo-700 dark:text-indigo-300">Across Industries</span>
            </div>

            <!-- Headline with inline code accent -->
            <h1 class="reveal mb-8 font-display text-4xl font-bold leading-[1.05] tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-[3.75rem]">
              Workflows that run<br />
              the world's most<br />
              <span class="relative">
                <span class="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-fuchsia-400">critical processes.</span>
                <span class="absolute -bottom-1 left-0 h-[3px] w-full rounded-full bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 opacity-30 dark:from-indigo-400 dark:via-violet-400 dark:to-fuchsia-400" />
              </span>
            </h1>

            <!-- Inline Pointy-lang snippet in hero -->
            <div class="reveal mb-10 inline-flex items-center gap-3 rounded-lg border border-slate-200/80 bg-white/60 px-4 py-2.5 backdrop-blur-sm dark:border-slate-800/60 dark:bg-slate-900/40">
              <span class="font-mono text-xs text-slate-500 dark:text-slate-500">$</span>
              <code class="font-mono text-xs text-slate-700 dark:text-slate-300">IngestQuery <span class="text-violet-500">-></span> RouteIntent <span class="text-violet-500">-></span> <span class="text-indigo-500">Process</span><span class="text-slate-400">(</span><span class="text-emerald-500">ok</span> <span class="text-violet-500">-></span> Respond<span class="text-slate-400">)</span></code>
              <span class="ml-1 flex items-center gap-1 text-xs text-emerald-500">
                <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                live
              </span>
            </div>

            <p class="reveal mb-10 max-w-xl text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              From loan originations to AI agent pipelines, from clinical data processing to real-time retail fulfilment — Volnux's workflow engine provides the same <span class="font-medium text-indigo-600 dark:text-indigo-400">readable, auditable, and governable</span> execution substrate across every industry.
            </p>

            <!-- Stats row -->
            <div class="reveal flex gap-10 border-t border-slate-200/80 pt-8 dark:border-slate-800/60">
              <div v-for="stat in heroStats" :key="stat.label" class="group">
                <div class="font-display text-3xl font-bold tracking-tight text-slate-900 transition-colors duration-300 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400 sm:text-4xl">{{ stat.value }}</div>
                <div class="mt-1 font-mono text-xs uppercase tracking-widest text-slate-400 dark:text-slate-600">{{ stat.label }}</div>
              </div>
            </div>
          </div>

          <!-- Right column — Industry Index -->
          <div class="hidden border-b border-l border-slate-200/80 pb-16 pl-12 pt-8 dark:border-slate-800/60 lg:block lg:pb-20">
            <div class="mb-4 flex items-center gap-2 border-b border-slate-200/80 pb-3 dark:border-slate-800/60">
              <span class="h-1 w-1 rounded-full bg-indigo-500" />
              <span class="font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500">Industry index</span>
            </div>
            <ul class="flex flex-col">
              <li
                v-for="item in industryIndex"
                :key="item.id"
                class="group/index relative flex cursor-pointer items-center justify-between py-3.5 transition-all duration-300 hover:pl-4"
                @click="scrollToSection(item.id)"
              >
                <!-- Animated left accent line -->
                <div
                  class="absolute left-0 top-1/2 h-0 w-[2px] -translate-y-1/2 rounded-full transition-all duration-300 group-hover/index:h-5"
                  :style="{ backgroundColor: getIndustryColor(item.id) }"
                />
                <div class="flex items-center gap-3.5">
                  <span class="font-mono text-[11px] text-slate-300 transition-colors duration-200 group-hover/index:text-slate-400 dark:text-slate-700 dark:group-hover/index:text-slate-500">{{ item.num }}</span>
                  <div
                    class="h-2 w-2 shrink-0 rounded-full transition-all duration-300 group-hover/index:scale-150 group-hover/index:shadow-lg"
                    :style="{
                      backgroundColor: getIndustryColor(item.id),
                      boxShadow: `0 0 0 0 rgba(${hexToRgb(getIndustryColor(item.id))}, 0)`,
                    }"
                  ></div>
                  <span class="text-sm font-medium text-slate-600 transition-colors duration-200 group-hover/index:text-slate-900 dark:text-slate-400 dark:group-hover/index:text-white">{{ item.label }}</span>
                </div>
                <span class="font-mono text-[11px] text-slate-300 transition-colors duration-200 group-hover/index:text-slate-500 dark:text-slate-700 dark:group-hover/index:text-slate-500">{{ item.count }}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Scroll indicator -->
      <div class="relative z-20 mx-auto flex w-full max-w-7xl items-center justify-center px-4 pb-8 sm:px-6 lg:px-8">
        <div class="reveal flex flex-col items-center gap-2">
          <span class="font-mono text-[10px] uppercase tracking-[0.3em] text-slate-400 dark:text-slate-600">Scroll to explore</span>
          <div class="flex h-10 w-5 items-start justify-center rounded-full border border-slate-300/60 p-1 dark:border-slate-700/60">
            <div class="h-2 w-1 animate-bounce rounded-full bg-indigo-500" />
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         INDUSTRY SECTIONS
         ============================================ -->
    <section
      v-for="(ind, idx) in industries"
      :key="ind.id"
      :id="ind.id"
      class="group/section relative border-t border-slate-200/80 transition-colors duration-300 dark:border-slate-800/40"
      :class="idx % 2 === 0 ? 'bg-slate-50/30 dark:bg-[#0c0c10]/50' : 'bg-white dark:bg-[#0a0a0f]'"
    >
      <!-- Industry Glow — visible by default, intensifies on hover -->
      <div
        class="pointer-events-none absolute inset-0 transition-opacity duration-1000 group-hover/section:opacity-100 opacity-60"
        :style="{
          background: `radial-gradient(ellipse_80%_50%_at_50%_0%, rgba(${hexToRgb(getIndustryColor(ind.id))}, 0.05), transparent 60%)`,
        }"
      ></div>

      <!-- Animated color line at top -->
      <div
        class="absolute left-0 top-0 h-[2px] w-0 transition-all duration-1000 group-hover/section:w-full"
        :style="{ backgroundColor: getIndustryColor(ind.id) }"
      />

      <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <!-- Header -->
        <div class="reveal grid grid-cols-1 items-start gap-8 border-b border-slate-200/80 py-16 sm:grid-cols-[80px_1fr] sm:py-20 lg:grid-cols-[100px_1fr_1fr] lg:gap-12 lg:py-24 dark:border-slate-800/60">
          <!-- Number with glow -->
          <div class="relative">
            <div
              class="font-display text-7xl font-bold leading-none sm:text-8xl lg:text-[6rem]"
              :style="{ color: `rgba(${hexToRgb(getIndustryColor(ind.id))}, 0.07)` }"
            >
              {{ ind.num }}
            </div>
            <div
              class="absolute -inset-4 rounded-full opacity-0 blur-2xl transition-opacity duration-700 group-hover/section:opacity-100"
              :style="{ background: `radial-gradient(circle, rgba(${hexToRgb(getIndustryColor(ind.id))}, 0.15), transparent 70%)` }"
            />
          </div>

          <!-- Title block -->
          <div>
            <div class="mb-4 flex items-center gap-3">
              <span
                class="h-[2px] w-8 rounded-full transition-all duration-500 group-hover/section:w-12"
                :style="{ backgroundColor: getIndustryColor(ind.id) }"
              />
              <span
                class="font-mono text-xs font-medium uppercase tracking-[0.2em] transition-colors duration-300"
                :style="{ color: getIndustryColor(ind.id) }"
              >
                {{ ind.kicker }}
              </span>
            </div>
            <h2 class="mb-5 font-display text-3xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-4xl lg:text-5xl">
              {{ ind.title }}<br />
              <em
                class="not-italic transition-all duration-500"
                :style="{ color: getIndustryColor(ind.id) }"
              >{{ ind.titleEm }}</em>
            </h2>
            <p class="max-w-lg text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
              {{ ind.desc }}
            </p>
          </div>

          <!-- Stats -->
          <div class="flex flex-row gap-8 border-l border-slate-200/80 pl-0 pt-6 sm:flex-col sm:gap-5 sm:border-slate-200/80 sm:pl-10 sm:pt-0 lg:pl-12 dark:border-slate-800/60">
            <div v-for="(stat, i) in ind.stats" :key="i" class="group/stat">
              <div
                class="font-display text-2xl font-bold text-slate-900 transition-colors duration-300 group-hover/stat:text-indigo-600 dark:text-white dark:group-hover/stat:text-indigo-400 sm:text-3xl"
                :style="{ transitionDelay: `${i * 50}ms` }"
              >{{ stat.value }}</div>
              <div class="mt-0.5 font-mono text-[11px] uppercase tracking-[0.15em] text-slate-400 dark:text-slate-600">{{ stat.label }}</div>
            </div>
          </div>
        </div>

        <!-- Cases Grid -->
        <div class="reveal-stagger py-10 sm:py-14 lg:py-16">
          <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6">
            <div
              v-for="(caseItem, i) in ind.cases"
              :key="i"
              class="case-card group/case relative overflow-hidden rounded-xl border border-slate-200/80 bg-white p-6 transition-all duration-500 hover:-translate-y-1.5 sm:p-7 dark:border-slate-800/60 dark:bg-slate-900/20"
              :class="[caseItem.wide ? 'sm:col-span-2' : '']"
              :style="{ transitionDelay: `${i * 80}ms` }"
            >
              <!-- Animated gradient border on hover -->
              <div
                class="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-500 group-hover/case:opacity-100"
                :style="{
                  background: `linear-gradient(135deg, rgba(${hexToRgb(getIndustryColor(ind.id))}, 0.06) 0%, transparent 40%, rgba(${hexToRgb(getIndustryColor(ind.id))}, 0.03) 100%)`,
                }"
              />

              <!-- Top accent line -->
              <div
                class="absolute left-6 right-6 top-0 h-[2px] rounded-b-full opacity-0 transition-all duration-500 group-hover/case:opacity-100 sm:left-7 sm:right-7"
                :style="{ backgroundColor: `rgba(${hexToRgb(getIndustryColor(ind.id))}, 0.4)` }"
              />

              <div class="relative" :class="caseItem.wide ? 'grid items-start gap-8 lg:grid-cols-[1fr_1fr]' : ''">
                <div>
                  <!-- Tag with animated dot -->
                  <div class="mb-5">
                    <span
                      class="inline-flex items-center gap-2 rounded-md border px-2.5 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.15em] transition-all duration-300 group-hover/case:border-opacity-60"
                      :style="{
                        borderColor: `rgba(${hexToRgb(getIndustryColor(ind.id))}, 0.2)`,
                        color: getIndustryColor(ind.id),
                        backgroundColor: `rgba(${hexToRgb(getIndustryColor(ind.id))}, 0.05)`,
                      }"
                    >
                      <span class="relative flex h-1.5 w-1.5">
                        <span
                          class="absolute inline-flex h-full w-full rounded-full opacity-0 transition-opacity duration-300 group-hover/case:animate-ping group-hover/case:opacity-75"
                          :style="{ backgroundColor: getIndustryColor(ind.id) }"
                        />
                        <span class="relative h-1.5 w-1.5 rounded-full" :style="{ backgroundColor: getIndustryColor(ind.id) }" />
                      </span>
                      {{ caseItem.tag }}
                    </span>
                  </div>

                  <h3 class="mb-3 font-display text-xl font-bold tracking-tight text-slate-900 transition-colors duration-300 group-hover/case:text-slate-800 dark:text-white dark:group-hover/case:text-white sm:text-2xl">{{ caseItem.title }}</h3>
                  <p class="mb-5 text-sm leading-relaxed text-slate-500 transition-colors duration-300 group-hover/case:text-slate-600 dark:text-slate-500 dark:group-hover/case:text-slate-400 sm:text-base">{{ caseItem.description }}</p>
                </div>

                <!-- Code block with glow -->
                <div class="relative">
                  <div
                    class="absolute -inset-1.5 rounded-xl opacity-0 blur-xl transition-all duration-700 group-hover/case:opacity-100"
                    :style="{
                      background: `linear-gradient(135deg, rgba(${hexToRgb(getIndustryColor(ind.id))}, 0.2), rgba(${hexToRgb(getIndustryColor(ind.id))}, 0.05), transparent 60%)`,
                    }"
                  />
                  <div class="relative overflow-hidden rounded-lg border border-slate-800/60 bg-[#0d0d12] shadow-2xl transition-all duration-500 group-hover/case:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] dark:border-slate-800/80 dark:group-hover/case:border-slate-700/60">
                    <!-- Top bar -->
                    <div class="flex items-center gap-2 border-b border-slate-800/40 px-4 py-2.5">
                      <div class="flex gap-1.5">
                        <div class="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                        <div class="h-2.5 w-2.5 rounded-full bg-amber-500/60" />
                        <div class="h-2.5 w-2.5 rounded-full bg-emerald-500/60" />
                      </div>
                      <span class="ml-2 font-mono text-[11px] text-slate-600">{{ ind.id }}_{{ caseItem.tag.toLowerCase().replace(/\s+/g, '_') }}.pointy</span>
                      <div class="ml-auto flex items-center gap-1.5">
                        <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        <span class="text-[11px] text-emerald-500/70">compiled</span>
                      </div>
                    </div>
                    <!-- Code -->
                    <div class="p-4 sm:p-5">
                      <pre class="whitespace-pre-wrap font-mono text-xs leading-relaxed sm:text-sm" v-html="caseItem.code"></pre>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         CROSS-INDUSTRY SECTION
         ============================================ -->
    <section class="relative overflow-hidden border-t border-slate-200/80 bg-slate-50/30 py-20 transition-colors duration-300 dark:border-slate-800/40 dark:bg-[#0c0c10]/50 sm:py-28">
      <!-- Background text watermark -->
      <div class="pointer-events-none absolute inset-0 flex items-center justify-center select-none">
        <span class="font-display text-[5rem] font-bold italic tracking-tight text-transparent [-webkit-text-stroke:1px_rgba(0,0,0,0.025)] sm:text-[7rem] lg:text-[10rem] dark:[-webkit-text-stroke:1px_rgba(255,255,255,0.025)]">
          ANY WORKFLOW
        </span>
      </div>

      <!-- Animated gradient mesh -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="absolute left-1/4 top-0 h-[300px] w-[300px] rounded-full bg-indigo-500/5 blur-[100px] animate-pulse-slow dark:bg-indigo-500/3" />
        <div class="absolute right-1/4 bottom-0 h-[250px] w-[250px] rounded-full bg-violet-500/5 blur-[100px] animate-pulse-slow [animation-delay:2s] dark:bg-violet-500/3" />
      </div>

      <!-- Subtle gradient overlay -->
      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.03),transparent_60%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.06),transparent_60%)]" />

      <div class="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div class="reveal">
            <!-- Pill badge -->
            <div class="mb-6 inline-flex items-center gap-2.5 rounded-full border border-indigo-200/80 bg-indigo-50/80 px-3.5 py-1.5 backdrop-blur-sm dark:border-indigo-500/20 dark:bg-indigo-500/8">
              <span class="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              <span class="text-sm font-medium text-indigo-700 dark:text-indigo-300">Cross-industry</span>
            </div>

            <h2 class="mb-6 font-display text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              One engine.<br />
              <span class="text-slate-400 dark:text-slate-500">Every use case.</span>
            </h2>
            <p class="mb-8 max-w-md text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
              Pointy-lang, the Volnux runtime, and the EventHub registry do not change between industries. The same readable syntax, the same P2P mesh, the same checkpoint-and-rehydrate execution model — applied to every workflow in your organisation.
            </p>
            <a href="/" class="group inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/40">
              Explore the platform
              <svg class="h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          <div class="reveal">
            <div class="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-slate-200/80 bg-slate-200/80 sm:grid-cols-2 dark:border-slate-800/60 dark:bg-slate-800/60">
              <div
                v-for="(feature, i) in crossFeatures"
                :key="i"
                class="group/feature relative bg-white p-6 transition-all duration-300 hover:bg-indigo-50/50 dark:bg-[#0c0c10] dark:hover:bg-indigo-500/5"
              >
                <!-- Icon -->
                <div
                  class="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-100/80 font-mono text-sm font-bold text-indigo-600 transition-all duration-300 group-hover/feature:bg-indigo-600 group-hover/feature:text-white group-hover/feature:shadow-lg group-hover/feature:shadow-indigo-500/25 dark:bg-indigo-500/10 dark:text-indigo-400 dark:group-hover/feature:bg-indigo-600 dark:group-hover/feature:text-white"
                >
                  {{ feature.icon }}
                </div>
                <h3 class="mb-1.5 font-semibold text-slate-900 dark:text-white">{{ feature.title }}</h3>
                <p class="text-xs leading-relaxed text-slate-500 dark:text-slate-500">{{ feature.desc }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============================================
         CTA SECTION
         ============================================ -->
    <section class="relative overflow-hidden border-t border-slate-200/80 py-24 transition-colors duration-300 dark:border-slate-800/40 dark:bg-[#0a0a0f] sm:py-32">
      <!-- Layered gradient background -->
      <div class="absolute inset-0 bg-gradient-to-b from-white via-slate-50/30 to-white transition-colors duration-300 dark:from-[#0c0c10] dark:via-[#0a0a0f] dark:to-[#0c0c10]" />

      <!-- Animated aurora blobs for CTA -->
      <div class="pointer-events-none absolute inset-0 overflow-hidden">
        <div class="aurora-blob aurora-blob-cta-1 absolute left-1/2 top-0 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-indigo-500/8 blur-[120px] dark:bg-indigo-500/6" />
        <div class="aurora-blob aurora-blob-cta-2 absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-violet-500/6 blur-[100px] dark:bg-violet-500/4" />
      </div>

      <!-- Light beam effect -->
      <div class="pointer-events-none absolute inset-0 flex items-start justify-center">
        <div class="cta-beam h-[200px] w-[1px] bg-gradient-to-b from-indigo-500/0 via-indigo-500/20 to-indigo-500/0 dark:via-indigo-400/10" />
      </div>

      <div class="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.04),transparent_70%)] dark:bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.08),transparent_70%)]" />

      <div class="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
        <div class="reveal">
          <!-- Pill badge -->
          <div class="mb-8 inline-flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-white/60 px-3.5 py-1.5 backdrop-blur-sm dark:border-slate-700/60 dark:bg-slate-900/40">
            <span class="relative flex h-2 w-2">
              <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
              <span class="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
            </span>
            <span class="text-sm font-medium text-slate-600 dark:text-slate-400">Ready to start?</span>
          </div>

          <h2 class="mb-6 font-display text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
            Your workflows,<br />
            <span class="bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 bg-clip-text text-transparent dark:from-indigo-400 dark:via-violet-400 dark:to-fuchsia-400">governed by default.</span>
          </h2>

          <p class="mb-12 text-base leading-relaxed text-slate-600 dark:text-slate-400 sm:text-lg">
            Every use case on this page runs on the same Volnux platform — open core, free to start, and available for early access today. Join the teams building the next generation of governed automation.
          </p>

          <div class="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <a href="/" class="group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-lg bg-indigo-600 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-xl hover:shadow-indigo-500/30">
              <span class="relative z-10">Get Early Access</span>
              <svg class="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
              <!-- Shimmer effect -->
              <div class="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </a>
            <a href="/docs" class="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200/80 bg-white/50 px-7 py-3.5 text-base font-medium text-slate-700 backdrop-blur-sm transition-all hover:border-indigo-500/50 hover:text-indigo-600 dark:border-slate-700/60 dark:bg-slate-900/50 dark:text-slate-300 dark:hover:border-indigo-500/40 dark:hover:text-white">
              Read the Docs
            </a>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<style scoped>
/* ============================================
   REVEAL ANIMATIONS
   ============================================ */
.reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal.revealed {
  opacity: 1;
  transform: translateY(0);
}

.reveal-stagger > * {
  opacity: 0;
  transform: translateY(24px);
  transition: opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.reveal-stagger.revealed > *:nth-child(1) { opacity: 1; transform: none; transition-delay: 0s; }
.reveal-stagger.revealed > *:nth-child(2) { opacity: 1; transform: none; transition-delay: 0.1s; }
.reveal-stagger.revealed > *:nth-child(3) { opacity: 1; transform: none; transition-delay: 0.2s; }
.reveal-stagger.revealed > *:nth-child(4) { opacity: 1; transform: none; transition-delay: 0.3s; }
.reveal-stagger.revealed > *:nth-child(5) { opacity: 1; transform: none; transition-delay: 0.4s; }
.reveal-stagger.revealed > *:nth-child(6) { opacity: 1; transform: none; transition-delay: 0.5s; }
.reveal-stagger.revealed > *:nth-child(7) { opacity: 1; transform: none; transition-delay: 0.6s; }
.reveal-stagger.revealed > *:nth-child(8) { opacity: 1; transform: none; transition-delay: 0.7s; }

/* ============================================
   AURORA BLOB ANIMATIONS
   ============================================ */
.aurora-blob {
  animation: aurora-float 8s ease-in-out infinite;
}

.aurora-blob-1 {
  animation-delay: 0s;
  animation-duration: 10s;
}

.aurora-blob-2 {
  animation-delay: -3s;
  animation-duration: 12s;
}

.aurora-blob-3 {
  animation-delay: -6s;
  animation-duration: 14s;
}

.aurora-blob-cta-1 {
  animation-delay: 0s;
  animation-duration: 8s;
}

.aurora-blob-cta-2 {
  animation-delay: -4s;
  animation-duration: 10s;
}

@keyframes aurora-float {
  0%, 100% {
    transform: translate(0, 0) scale(1);
  }
  25% {
    transform: translate(30px, -20px) scale(1.05);
  }
  50% {
    transform: translate(-20px, 20px) scale(0.95);
  }
  75% {
    transform: translate(15px, 10px) scale(1.02);
  }
}

/* ============================================
   SLOW PULSE (for gradient mesh)
   ============================================ */
.animate-pulse-slow {
  animation: pulse-slow-custom 6s ease-in-out infinite;
}

@keyframes pulse-slow-custom {
  0%, 100% {
    opacity: 0.4;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.1);
  }
}

/* ============================================
   CTA LIGHT BEAM
   ============================================ */
.cta-beam {
  animation: beam-glow 4s ease-in-out infinite;
}

@keyframes beam-glow {
  0%, 100% {
    opacity: 0.3;
    height: 200px;
  }
  50% {
    opacity: 0.8;
    height: 300px;
  }
}

/* ============================================
   SHIMMER (CTA button)
   ============================================ */
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

.animate-shimmer {
  animation: shimmer 3s ease-in-out infinite;
  animation-delay: 1s;
}

/* ============================================
   CASE CARD ENHANCED HOVER
   ============================================ */
.case-card {
  transition-property: transform, box-shadow, border-color;
}

.case-card:hover {
  box-shadow: 0 20px 60px -15px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(99, 102, 241, 0.05);
}

:deep(.dark) .case-card:hover {
  box-shadow: 0 20px 60px -15px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(99, 102, 241, 0.1);
}

/* ============================================
   SELECTION
   ============================================ */
::selection {
  background: rgba(99, 102, 241, 0.3);
  color: white;
}
</style>
