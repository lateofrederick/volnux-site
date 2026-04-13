import type { PaletteSectionDef } from '@/types/wizard'

export const paletteSections: PaletteSectionDef[] = [
  {
    id: 'sec-extract',
    title: 'Extract',
    events: [
      { type: 'PostgresExtract', cat: 'extract', source: 'pypi', color: '#00e5ff', icon: 'PG', sub: 'pypi · v2.4.1' },
      { type: 'KafkaIngest', cat: 'extract', source: 'pypi', color: '#00e5ff', icon: 'KFK', sub: 'pypi · v1.3.0' },
      { type: 'S3Extract', cat: 'extract', source: 'hub', color: '#00e5ff', icon: 'S3E', sub: 'hub · v1.0.2' },
      { type: 'RestApiExtract', cat: 'extract', source: 'hub', color: '#00e5ff', icon: 'API', sub: 'hub · v0.8.1' },
    ],
  },
  {
    id: 'sec-transform',
    title: 'Transform',
    events: [
      { type: 'NormaliseTimestamps', cat: 'transform', source: 'pypi', color: '#7b61ff', icon: 'NRM', sub: 'pypi · v1.1.0' },
      { type: 'JsonFlatten', cat: 'transform', source: 'pypi', color: '#7b61ff', icon: 'JSN', sub: 'pypi · v2.0.0' },
      { type: 'DeduplicateRows', cat: 'transform', source: 'hub', color: '#7b61ff', icon: 'DDP', sub: 'hub · v1.2.0' },
    ],
  },
  {
    id: 'sec-ai',
    title: 'AI & Agents',
    events: [
      { type: 'GPT4Transform', cat: 'ai', source: 'hub', color: '#ff6eb4', icon: 'GPT', sub: 'hub · v1.8.0' },
      { type: 'EmbedDocuments', cat: 'ai', source: 'hub', color: '#ff6eb4', icon: 'EMB', sub: 'hub · v0.9.2' },
      { type: 'ClassifyIntent', cat: 'ai', source: 'hub', color: '#ff6eb4', icon: 'CLS', sub: 'hub · v0.6.0' },
    ],
  },
  {
    id: 'sec-validate',
    title: 'Validate',
    events: [
      { type: 'SchemaValidate', cat: 'validate', source: 'git', color: '#00ff94', icon: 'SCH', sub: 'git · v2.0.1' },
      { type: 'TypeCheck', cat: 'validate', source: 'pypi', color: '#00ff94', icon: 'TYP', sub: 'pypi · v1.0.0' },
    ],
  },
  {
    id: 'sec-load',
    title: 'Load',
    events: [
      { type: 'SnowflakeLoad', cat: 'load', source: 'hub', color: '#ffb830', icon: 'SNF', sub: 'hub · v1.0.4' },
      { type: 'S3Load', cat: 'load', source: 'pypi', color: '#ffb830', icon: 'S3L', sub: 'pypi · v3.1.2' },
      { type: 'RedisCache', cat: 'load', source: 'git', color: '#ffb830', icon: 'RDS', sub: 'git · v1.1.3' },
    ],
  },
  {
    id: 'sec-notify',
    title: 'Notify',
    events: [
      { type: 'SlackNotify', cat: 'notify', source: 'pypi', color: '#00d4aa', icon: 'SLK', sub: 'pypi · v1.5.0' },
      { type: 'EmailAlert', cat: 'notify', source: 'hub', color: '#00d4aa', icon: 'EML', sub: 'hub · v1.0.0' },
    ],
  },
]
