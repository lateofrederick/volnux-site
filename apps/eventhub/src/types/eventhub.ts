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
  /** Full HTML for the description column (trusted static content from data files). */
  descriptionCellHtml?: string
}

export interface EventHubCodeExample {
  title: string
  language: string
  code: string
}

/** One block inside an overview doc-section (matches event-detail.html structure). */
export type EventHubOverviewContentItem =
  | { type: 'p'; html: string }
  | { type: 'h3'; text: string }
  | { type: 'code'; language: string; code: string }

export interface EventHubOverviewSection {
  heading: string
  content: EventHubOverviewContentItem[]
}

export interface EventHubUsedWithCard {
  slug: string
  icon: string
  name: string
  description: string
  /** e.g. "77.1k / mo · pypi" */
  downloadsLine: string
}

export interface EventHubChangelogEntry {
  version: string
  date: string
  tag: 'feature' | 'fix' | 'breaking' | 'perf'
  items: string[]
  /** When true, each item is rendered with v-html (trusted static copy only). */
  itemsAreHtml?: boolean
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
  /**
   * When set, the Overview tab renders these sections instead of `overview` + `interfaceCode`
   * (matches prototypes/event-detail.html).
   */
  overviewSections?: EventHubOverviewSection[]
  /** Sidebar card title for install snippets (default: "Install references"). */
  sidebarInstallTitle?: string
  /** Bar heights as percentage strings for the downloads chart (12 bars). */
  downloadChartBars?: string[]
  /** Extra dependency row (e.g. tenacity) — merged with dependencies in UI if needed. */
  extraDependencies?: Array<{ name: string; version: string }>
  /** HTML for “Reference in Pointy-lang” card (trusted static). */
  pointyReferenceHtml?: string
  /** Replace generic “Related events” block (title + cards). */
  relatedSectionTitle?: string
  usedWithCards?: EventHubUsedWithCard[]
  /** Styled install rows for sidebar (matches event-detail.html). */
  installSnippets?: Array<{
    copyText: string
    source: 'pypi' | 'hub'
    pkg: string
    ver: string
  }>
  /** H2 above changelog list (default: "Version history"). */
  changelogHeading?: string
  /** H2 above parameters table (default: "Parameters"). */
  parametersHeading?: string
  /** H2 above usage examples (default: hidden; set for rich pages). */
  examplesHeading?: string
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
  /** Per-tag accent: `null` = plain `.tag` only; omit key for default `.tag.tag--cyan`. */
  tagAccent?: Record<string, 'tag--cyan' | 'tag--green' | null>
  source: EventSource
  downloadsMonthly: string
  verified: 'official' | 'community'
  stats: EventHubStat[]
  detail: EventHubDetail
}
