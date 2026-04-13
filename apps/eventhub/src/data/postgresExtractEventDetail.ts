import type { EventHubDetail } from '@/types/eventhub'

const c = (text: string) =>
  `<code style="font-family:'DM Mono',monospace;color:var(--cyan);font-size:0.85em">${text}</code>`

const codeAmber = (text: string) =>
  `<code style="font-family:'DM Mono',monospace;font-size:0.8em;color:var(--amber)">${text}</code>`

const codeCyanSmall = (text: string) =>
  `<code style="font-family:'DM Mono',monospace;font-size:0.8em;color:var(--cyan)">${text}</code>`

const codeFog = (text: string) =>
  `<code style="font-family:'DM Mono',monospace;font-size:0.8em;color:var(--fog2)">${text}</code>`

/**
 * Full EventHub detail for PostgresExtract — content aligned with prototypes/event-detail.html.
 */
export const postgresExtractDetail: EventHubDetail = {
  publisher: 'volnux-official',
  license: 'MIT',
  published: 'Nov 12, 2024',
  python: '>=3.11',
  sourceUrl: 'https://github.com/nshaibu/volnux',
  issuesUrl: 'https://github.com/nshaibu/volnux/issues',
  pypiUrl: 'https://pypi.org/project/event-pipeline/',
  installRefs: ['pypi:PostgresExtract@v2.4.1', 'hub:volnux/PostgresExtract@v2.4.1'],
  dependencies: [
    { name: 'asyncpg', version: '>=0.29' },
    { name: 'volnux-core', version: '>=0.8' },
    { name: 'pydantic', version: '>=2.0' },
    { name: 'tenacity', version: '>=8.2' },
  ],
  compatibility: ['0.8.x', '0.9.x', '0.10.x', '1.0-beta'],
  overview: [],
  interfaceCode: '',
  sidebarInstallTitle: 'Install in Pointy-lang',
  downloadChartBars: ['45%', '52%', '48%', '60%', '55%', '65%', '75%', '68%', '70%', '72%', '74%', '78%'],
  relatedSectionTitle: 'Used with',
  pointyReferenceHtml: `<div class="used-in-block">
<span style="color:var(--green)">pypi</span><span style="color:var(--amber)">:PostgresExtract</span><span style="color:var(--cyan)">@v2.4.1</span><br>
&nbsp;&nbsp;<span style="color:var(--cyan)">-></span> <span style="color:#eef2fa">Transform</span><br>
&nbsp;&nbsp;<span style="color:var(--cyan)">-></span> <span style="color:#eef2fa">Load</span>
</div>`,
  usedWithCards: [
    {
      slug: 's3-load',
      icon: 'S3',
      name: 'S3Load',
      description: 'Load extracted rows to AWS S3 with multipart upload, compression, and path templating.',
      downloadsLine: '77.1k / mo · pypi',
    },
    {
      slug: 'schema-validate',
      icon: 'SCH',
      name: 'SchemaValidate',
      description: 'Validate extracted records against a Pydantic or JSON Schema before downstream processing.',
      downloadsLine: '29.6k / mo · git',
    },
    {
      slug: 'snowflake-load',
      icon: 'SNF',
      name: 'SnowflakeLoad',
      description: 'Bulk-load validated data into Snowflake with COPY INTO, merge support, and auto-staging.',
      downloadsLine: '38.3k / mo · hub',
    },
  ],
  installSnippets: [
    { copyText: 'pypi:PostgresExtract@v2.4.1', source: 'pypi' as const, pkg: ':PostgresExtract', ver: '@v2.4.1' },
    { copyText: 'hub:volnux/PostgresExtract@v2.4.1', source: 'hub' as const, pkg: ':volnux/PostgresExtract', ver: '@v2.4.1' },
  ],
  overviewSections: [
    {
      heading: 'What it does',
      content: [
        {
          type: 'p',
          html: `${c('PostgresExtract')} connects to a PostgreSQL instance and streams rows from a table or custom query into your Volnux workflow. It handles all the operational complexity of reliable extraction: cursor-based pagination prevents memory overflow on large tables, watermark-based incremental extraction avoids re-reading unchanged data, and the adaptive buffer automatically switches from small-mode to batch-mode as row volume grows.`,
        },
        {
          type: 'p',
          html: `Every extraction run emits an ${c('EventResult')} per batch, making it composable with ${c('MAP')} for parallel downstream transforms and with ${c('||')} sync barriers for fan-out validation.`,
        },
        {
          type: 'code',
          language: 'pointy-lang',
          code: `# Simple extraction
pypi:PostgresExtract@v2.4.1 -> Transform -> Load

# With parallel validation and checkpoint
pypi:PostgresExtract@v2.4.1[node="warehouse"]
  |-> MAP<SchemaValidate> || Checkpoint
  -> SnowflakeLoad`,
        },
      ],
    },
    {
      heading: 'Quick start',
      content: [
        { type: 'h3', text: 'Installation' },
        {
          type: 'p',
          html: 'Reference directly in Pointy-lang — no installation required. Volnux pulls the package at runtime from PyPI.',
        },
        {
          type: 'code',
          language: 'python (local development)',
          code: 'pip install volnux-postgres-extract==2.4.1',
        },
        { type: 'h3', text: 'Minimal example' },
        {
          type: 'code',
          language: 'python',
          code: `from volnux_postgres_extract import PostgresExtract

event = PostgresExtract(
  dsn="postgresql://user:pass@host:5432/mydb",
  table="orders",
  batch_size=1000,
)

# Used automatically by the Volnux runtime
# when referenced in Pointy-lang`,
        },
        { type: 'h3', text: 'Incremental extraction' },
        {
          type: 'code',
          language: 'python',
          code: `event = PostgresExtract(
  dsn="postgresql://...",
  table="events",
  watermark_column="updated_at",
  watermark_value="2024-01-01T00:00:00Z",
  order_by="updated_at ASC",
  batch_size=5000,
)`,
        },
      ],
    },
    {
      heading: 'Interface contract',
      content: [
        {
          type: 'p',
          html: `${c('PostgresExtract')} implements the ${c('EventBase')} interface. Its ${c('__call__')} coroutine accepts no positional arguments — all configuration is provided at construction time via ${c('__init__')}.`,
        },
        {
          type: 'code',
          language: 'python — type signature',
          code: `class PostgresExtract(EventBase):
  def __init__(
    self,
    dsn: str,
    table: str,
    query: Optional[str] = None,
    batch_size: int = 1000,
    watermark_column: Optional[str] = None,
    watermark_value: Optional[str] = None,
    ssl: bool = False,
    pool_size: int = 5,
    timeout: int = 30,
    columns: Optional[List[str]] = None,
    order_by: Optional[str] = None,
  ) -> None: ...

  async def __call__(self) -> EventResult: ...`,
        },
      ],
    },
  ],
  parametersHeading: 'Constructor parameters',
  parameters: [
    {
      name: 'dsn',
      type: 'str',
      required: true,
      description: '',
      descriptionCellHtml: `<p class="param-desc">PostgreSQL connection string in libpq DSN format. Supports all standard libpq parameters including host, port, dbname, user, password, sslmode.</p>
<p class="param-default">e.g. ${codeAmber('"postgresql://user:pass@host:5432/db"')}</p>`,
    },
    {
      name: 'table',
      type: 'str',
      required: true,
      description: '',
      descriptionCellHtml: `<p class="param-desc">Name of the table to extract. Supports schema-qualified names (${codeAmber('"schema.table"')}). Ignored when ${codeCyanSmall('query')} is set.</p>`,
    },
    {
      name: 'query',
      type: 'str | None',
      required: false,
      description: '',
      descriptionCellHtml: `<p class="param-desc">Custom SQL SELECT statement. When provided, overrides ${codeCyanSmall('table')} and ${codeCyanSmall('columns')}. Must be a read-only SELECT — DDL and DML are rejected.</p>
<p class="param-default">Default: ${codeFog('None')}</p>`,
    },
    {
      name: 'batch_size',
      type: 'int',
      required: false,
      description: '',
      descriptionCellHtml: `<p class="param-desc">Number of rows fetched per cursor iteration. Larger values increase throughput but use more memory per batch. The adaptive mini-context buffers automatically when this exceeds the small-mode threshold.</p>
<p class="param-default">Default: ${codeFog('1000')}</p>`,
    },
    {
      name: 'watermark_column',
      type: 'str | None',
      required: false,
      description: '',
      descriptionCellHtml: `<p class="param-desc">Column name used for incremental extraction. Must be indexed for performance. Typically a ${codeAmber('TIMESTAMP')} or monotonically increasing integer.</p>
<p class="param-default">Default: ${codeFog('None')} (full table scan)</p>`,
    },
    {
      name: 'watermark_value',
      type: 'str | None',
      required: false,
      description: '',
      descriptionCellHtml: `<p class="param-desc">Only rows where ${codeCyanSmall('watermark_column')} is greater than this value are extracted. ISO 8601 for timestamps, numeric string for integer columns.</p>
<p class="param-default">Default: ${codeFog('None')}</p>`,
    },
    {
      name: 'ssl',
      type: 'bool',
      required: false,
      description: '',
      descriptionCellHtml: `<p class="param-desc">Enable SSL/TLS for the connection. Sets ${codeAmber('sslmode=require')}. For full certificate control, embed SSL parameters in the DSN string directly.</p>
<p class="param-default">Default: ${codeFog('False')}</p>`,
    },
    {
      name: 'pool_size',
      type: 'int',
      required: false,
      description: '',
      descriptionCellHtml: `<p class="param-desc">Maximum number of connections in the asyncpg connection pool. Increase for parallel shard reads, decrease for connection-limited managed databases.</p>
<p class="param-default">Default: ${codeFog('5')}</p>`,
    },
    {
      name: 'columns',
      type: 'list[str] | None',
      required: false,
      description: '',
      descriptionCellHtml: `<p class="param-desc">Column whitelist. When set, only the specified columns are included in the extracted rows. Reduces network transfer for wide tables.</p>
<p class="param-default">Default: ${codeFog('None')} (all columns)</p>`,
    },
    {
      name: 'timeout',
      type: 'int',
      required: false,
      description: '',
      descriptionCellHtml: `<p class="param-desc">Connection and query timeout in seconds. Applies to both the initial connection and each batch fetch. Timed-out extractions emit an error result and trigger the failure branch.</p>
<p class="param-default">Default: ${codeFog('30')}</p>`,
    },
  ],
  examplesHeading: 'Usage examples',
  usageExamples: [
    {
      title: 'Full pipeline — Postgres to Snowflake',
      language: 'pointy-lang',
      code: `pypi:PostgresExtract@v2.4.1[node="prod-db"]
  |-> MAP<SchemaValidate> || Checkpoint
  -> NormaliseTimestamps[executor="celery"]
  -> Process(
    success -> hub:SnowflakeLoad@v1.0.4,
    failure -> Quarantine -> SlackNotify
  )`,
    },
    {
      title: 'Incremental daily sync',
      language: 'python — init kwargs',
      code: `# Pass as event_init_kwargs in RemoteTaskPayload
{
  "dsn": "postgresql://...",
  "table": "user_events",
  "watermark_column": "created_at",
  "watermark_value": "2024-06-01T00:00:00Z",
  "batch_size": 5000,
  "columns": ["id", "user_id", "event_type", "created_at"],
  "ssl": True,
}`,
    },
    {
      title: 'Custom query with parallel fan-out',
      language: 'pointy-lang',
      code: `# Multi-table join, fan to AI enrichment and archive
pypi:PostgresExtract@v2.4.1
  |-> EnrichWithAI[node="gpu-cluster"] * 3
  |-> ArchiveRaw[executor="celery"]
  || Checkpoint
  -> MergeResults -> Publish`,
    },
  ],
  changelogHeading: 'Version history',
  changelog: [
    {
      version: 'v2.4.1',
      date: '2024-11-12',
      tag: 'fix',
      itemsAreHtml: true,
      items: [
        'Fixed cursor leak when extraction is cancelled mid-batch via workflow checkpoint',
        'Corrected watermark comparison for <code style="font-family:\'DM Mono\',monospace;font-size:0.85em;color:var(--cyan)">TIMESTAMPTZ</code> columns with non-UTC offsets',
        'Pool connections now released correctly on SSL handshake timeout',
      ],
    },
    {
      version: 'v2.4.0',
      date: '2024-10-28',
      tag: 'feature',
      itemsAreHtml: true,
      items: [
        'Added <code style="font-family:\'DM Mono\',monospace;font-size:0.85em;color:var(--cyan)">columns</code> parameter for column whitelisting — reduces network transfer for wide tables by up to 70%',
        'Added <code style="font-family:\'DM Mono\',monospace;font-size:0.85em;color:var(--cyan)">order_by</code> parameter for deterministic extraction ordering',
        'Schema inference now caches column types per connection to avoid per-batch introspection overhead',
      ],
    },
    {
      version: 'v2.3.0',
      date: '2024-09-14',
      tag: 'perf',
      itemsAreHtml: true,
      items: [
        'Switched internal cursor from <code style="font-family:\'DM Mono\',monospace;font-size:0.85em;color:var(--cyan)">fetchmany()</code> to server-side named cursors — 3× throughput on large tables',
        'Connection pool reuse across batches in the same execution context',
        'Reduced per-row allocation overhead by 40% via record deduplication in the codec layer',
      ],
    },
    {
      version: 'v2.0.0',
      date: '2024-07-03',
      tag: 'breaking',
      itemsAreHtml: true,
      items: [
        '<code style="font-family:\'DM Mono\',monospace;font-size:0.85em;color:var(--cyan)">connection_string</code> parameter renamed to <code style="font-family:\'DM Mono\',monospace;font-size:0.85em;color:var(--cyan)">dsn</code> — update all init kwargs',
        'Dropped support for synchronous execution mode — all extraction is now async-only',
        'Minimum Python version raised to 3.11',
        'Results now emitted as batched <code style="font-family:\'DM Mono\',monospace;font-size:0.85em;color:var(--cyan)">EventResult</code> objects rather than a single result with all rows',
      ],
    },
    {
      version: 'v1.9.2',
      date: '2024-05-18',
      tag: 'fix',
      itemsAreHtml: true,
      items: [
        'Watermark extraction now handles <code style="font-family:\'DM Mono\',monospace;font-size:0.85em;color:var(--cyan)">NULL</code> values in watermark column without crashing',
        'Improved error messages for connection refusal and authentication failure',
      ],
    },
  ],
}
