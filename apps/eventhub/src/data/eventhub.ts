import type { EventHubEvent, EventSource } from '@/types/eventhub'
import { postgresExtractDetail } from '@/data/postgresExtractEventDetail'

const categories = [
  'All',
  'Data Pipelines',
  'AI & Agents',
  'Streaming',
  'Databases',
  'Notifications',
  'Cloud Storage',
] as const

function makeBasicDetail(event: Pick<EventHubEvent, 'name' | 'version' | 'source' | 'tags'>) {
  return {
    publisher: event.source === 'hub' ? 'community-verified' : 'volnux-official',
    license: 'MIT',
    published: '2024-11-12',
    python: '>=3.11',
    sourceUrl: 'https://github.com/nshaibu/volnux',
    issuesUrl: 'https://github.com/nshaibu/volnux/issues',
    pypiUrl: 'https://pypi.org/project/event-pipeline/',
    installRefs: [`${event.source}:${event.name}@${event.version}`],
    dependencies: [
      { name: 'volnux-core', version: '>=0.8' },
      { name: 'tenacity', version: '>=8.2' },
    ],
    compatibility: ['0.8.x', '0.9.x', '0.10.x'],
    overview: [
      `${event.name} is a reusable EventBase component for Volnux workflows.`,
      'Use this as a drop-in event in Pointy-lang and evolve configuration over time.',
    ],
    interfaceCode: `class ${event.name}(EventBase):\n    async def __call__(self, payload) -> EventResult:\n        ...`,
    usageExamples: [
      {
        title: 'Pointy reference',
        language: 'pointy-lang',
        code: `${event.source}:${event.name}@${event.version}\n  -> Process\n  -> Store`,
      },
    ],
    parameters: [
      {
        name: 'payload',
        type: 'dict',
        required: true,
        description: 'Input payload forwarded from the previous event.',
      },
    ],
    changelog: [
      {
        version: event.version,
        date: '2024-11-12',
        tag: 'feature' as const,
        items: ['Initial public listing in EventHub.'],
      },
    ],
  }
}

export const eventHubEvents: EventHubEvent[] = [
  {
    slug: 'postgres-extract',
    name: 'PostgresExtract',
    version: 'v2.4.1',
    icon: 'PG',
    accent: 'cyan',
    category: 'Data Pipelines',
    description:
      'Extract data from PostgreSQL tables with configurable batch size, cursor-based pagination, and automatic schema inference. Supports SSL, connection pooling, incremental extraction via watermark columns, and parallel shard reading for large tables.',
    tags: ['postgres', 'etl', 'extract', 'database', 'sql', 'incremental', 'streaming'],
    tagAccent: {
      postgres: 'tag--cyan',
      etl: 'tag--cyan',
      extract: null,
      database: null,
      sql: null,
      incremental: null,
      streaming: 'tag--green',
    },
    source: 'pypi',
    downloadsMonthly: '84.2k / mo',
    verified: 'official',
    stats: [
      { label: 'Monthly pulls', value: '84.2k' },
      { label: 'Total pulls', value: '2.1M' },
      { label: 'Success rate', value: '98.4%' },
      { label: 'Latest', value: 'v2.4.1' },
    ],
    detail: postgresExtractDetail,
  },
  {
    slug: 'gpt4-transform',
    name: 'GPT4Transform',
    version: 'v1.8.0',
    icon: 'GPT',
    accent: 'purple',
    category: 'AI & Agents',
    description: 'Transforms records using GPT-4 with structured JSON output and retry semantics.',
    tags: ['ai', 'llm', 'transform', 'openai'],
    source: 'hub',
    downloadsMonthly: '61.5k / mo',
    verified: 'official',
    stats: [],
    detail: makeBasicDetail({ name: 'GPT4Transform', version: 'v1.8.0', source: 'hub', tags: ['ai'] }),
  },
  {
    slug: 's3-load',
    name: 'S3Load',
    version: 'v3.1.2',
    icon: 'S3',
    accent: 'amber',
    category: 'Cloud Storage',
    description: 'Uploads processed batches to S3 with multipart and compression support.',
    tags: ['s3', 'aws', 'load', 'storage'],
    source: 'pypi',
    downloadsMonthly: '77.1k / mo',
    verified: 'official',
    stats: [],
    detail: makeBasicDetail({ name: 'S3Load', version: 'v3.1.2', source: 'pypi', tags: ['s3'] }),
  },
  {
    slug: 'kafka-ingest',
    name: 'KafkaIngest',
    version: 'v1.3.0',
    icon: 'KFK',
    accent: 'green',
    category: 'Streaming',
    description: 'Consumes Kafka topics with configurable groups and offset control.',
    tags: ['kafka', 'streaming', 'ingest', 'messaging'],
    source: 'pypi',
    downloadsMonthly: '42.8k / mo',
    verified: 'official',
    stats: [],
    detail: makeBasicDetail({ name: 'KafkaIngest', version: 'v1.3.0', source: 'pypi', tags: ['kafka'] }),
  },
  {
    slug: 'snowflake-load',
    name: 'SnowflakeLoad',
    version: 'v1.0.4',
    icon: 'SNF',
    accent: 'cyan',
    category: 'Data Pipelines',
    description: 'Bulk-loads data into Snowflake with COPY INTO and merge/upsert modes.',
    tags: ['snowflake', 'load', 'warehouse', 'etl'],
    source: 'hub',
    downloadsMonthly: '38.3k / mo',
    verified: 'official',
    stats: [],
    detail: makeBasicDetail({ name: 'SnowflakeLoad', version: 'v1.0.4', source: 'hub', tags: ['snowflake'] }),
  },
  {
    slug: 'schema-validate',
    name: 'SchemaValidate',
    version: 'v2.0.1',
    icon: 'SCH',
    accent: 'pink',
    category: 'Data Pipelines',
    description: 'Validates records against schema definitions and emits structured errors.',
    tags: ['validate', 'schema', 'pydantic', 'quality'],
    source: 'git',
    downloadsMonthly: '29.6k / mo',
    verified: 'official',
    stats: [],
    detail: makeBasicDetail({ name: 'SchemaValidate', version: 'v2.0.1', source: 'git', tags: ['schema'] }),
  },
]

export const eventHubCategories = categories

export const sourceLabels: Record<EventSource, string> = {
  pypi: 'PyPI',
  git: 'Git',
  hub: 'EventHub',
  local: 'Local',
}

export function findEventBySlug(slug: string) {
  return eventHubEvents.find((e) => e.slug === slug) ?? null
}

export function relatedEvents(currentSlug: string, max = 3) {
  return eventHubEvents.filter((e) => e.slug !== currentSlug).slice(0, max)
}
