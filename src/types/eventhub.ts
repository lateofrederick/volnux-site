export type EventSource = 'pypi' | 'git' | 'hub' | 'local'

export interface EventHubStat {
  label: string
  value: string
}

export interface EventHubParameter {
  name: string
  type: string
  required: boolean
  description: string
  defaultValue?: string
}

export interface EventHubCodeExample {
  title: string
  language: string
  code: string
}

export interface EventHubChangelogEntry {
  version: string
  date: string
  tag: 'feature' | 'fix' | 'breaking' | 'perf'
  items: string[]
}

export interface EventHubDetail {
  publisher: string
  license: string
  published: string
  python: string
  sourceUrl: string
  issuesUrl: string
  pypiUrl?: string
  installRefs: string[]
  dependencies: Array<{ name: string; version: string }>
  compatibility: string[]
  overview: string[]
  interfaceCode: string
  usageExamples: EventHubCodeExample[]
  parameters: EventHubParameter[]
  changelog: EventHubChangelogEntry[]
}

export interface EventHubEvent {
  slug: string
  name: string
  version: string
  icon: string
  accent: 'cyan' | 'purple' | 'green' | 'amber' | 'red' | 'pink'
  category: string
  description: string
  tags: string[]
  source: EventSource
  downloadsMonthly: string
  verified: 'official' | 'community'
  stats: EventHubStat[]
  detail: EventHubDetail
}
