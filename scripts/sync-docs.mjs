/**
 * Sync documentation from the Volnux / event-pipeline repository into public/docs/
 * so the marketing site can load Markdown without editing Vue.
 *
 * Usage: from volnux-site root:  npm run docs:sync
 *
 * Override source tree: DOCS_SOURCE_ROOT=/path/to/event_pipeline
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync, rmSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildExampleTutorialPages } from './example-tutorial-pages.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
const SITE_ROOT = join(__dirname, '..')
const OUT_DIR = join(SITE_ROOT, 'public', 'docs')
const MD_DIR = join(OUT_DIR, 'markdown')
const DEFAULT_SOURCE = join(SITE_ROOT, '..', 'event_pipeline')

const SOURCE_ROOT = process.env.DOCS_SOURCE_ROOT || DEFAULT_SOURCE
const TUTORIAL = join(SOURCE_ROOT, 'TUTORIAL.md')
const API_RST_DIR = join(SOURCE_ROOT, 'docs', 'source', 'api')
const EXAMPLES_DIR = join(SOURCE_ROOT, 'examples')

/** Do not publish these TUTORIAL.md chapters in the site nav. */
const SKIP_TUTORIAL_SLUGS = new Set(['contributing', 'reporting-issues', 'license', 'requirements'])

function slugifyHeading(line) {
  return line
    .replace(/^#\s+/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'section'
}

function stripTutorialPreamble(text) {
  const intro = '# Introduction'
  const i = text.indexOf(intro)
  if (i === -1) return text
  return text.slice(i)
}

/** Only these lines are real ATX H1s in TUTORIAL.md (Python `# comments` must not split). */
const TUTORIAL_H1_TITLES = new Set([
  'Introduction',
  'Requirements',
  'Usage',
  'Pipeline',
  'Scheduling',
  'Defining Events',
  'Signals',
  'Telemetry',
  'Contributing',
  'Reporting Issues',
  'License',
])

function isCanonicalTutorialH1(line) {
  const m = line.match(/^# (.+)$/)
  if (!m) return false
  return TUTORIAL_H1_TITLES.has(m[1].trim())
}

function splitMarkdownByTutorialH1(text) {
  const lines = text.split('\n')
  const sections = []
  let buf = []

  const flush = () => {
    const chunk = buf.join('\n').trim()
    if (chunk) sections.push(chunk)
    buf = []
  }

  for (const line of lines) {
    if (isCanonicalTutorialH1(line)) {
      flush()
      buf.push(line)
    } else {
      buf.push(line)
    }
  }
  flush()
  return sections
}

function rewriteTutorialImages(md) {
  return md.replace(/\]\(img\//g, '](https://raw.githubusercontent.com/nshaibu/volnux/main/img/')
}

function wrapRstAsMarkdown(title, _filename, rstBody) {
  return `# ${title}

~~~text
${rstBody}
~~~
`
}

/** Sidebar / page title: drop leading "API Reference - " from Sphinx H1s. */
function shortApiNavTitle(longTitle, filename) {
  const t = (longTitle || '').trim()
  const m = t.match(/^API\s+Reference\s*-\s*(.+)$/i)
  if (m) return m[1].trim()
  if (/^API\s+Reference$/i.test(t)) return 'Overview'
  return t || filename.replace(/\.rst$/, '')
}

function main() {
  const groups = []

  if (!existsSync(SOURCE_ROOT)) {
    console.warn(`[docs:sync] Source not found: ${SOURCE_ROOT} — skip sync (keep committed public/docs).`)
    return
  }

  if (existsSync(MD_DIR)) rmSync(MD_DIR, { recursive: true })
  mkdirSync(MD_DIR, { recursive: true })

  const tutorialSections = []

  if (existsSync(TUTORIAL)) {
    let body = readFileSync(TUTORIAL, 'utf8')
    body = stripTutorialPreamble(body)
    body = rewriteTutorialImages(body)
    let chunks = splitMarkdownByTutorialH1(body)
    // Drop a standalone `# Usage` section — the real guide continues under `# Pipeline`
    for (let i = 0; i < chunks.length; i++) {
      if (chunks[i]?.trim() === '# Usage' && chunks[i + 1]?.trimStart().startsWith('# Pipeline')) {
        chunks.splice(i, 1)
        break
      }
    }

    for (const chunk of chunks) {
      const firstLine = chunk.split('\n')[0] || ''
      const slug = slugifyHeading(firstLine)
      if (SKIP_TUTORIAL_SLUGS.has(slug)) continue
      const fname = `tutorial--${slug}.md`
      const path = `markdown/${fname}`
      writeFileSync(join(MD_DIR, fname), chunk + '\n', 'utf8')
      tutorialSections.push({
        id: `tutorial-${slug}`,
        title: firstLine.replace(/^#\s+/, '').trim(),
        path,
      })
    }
    groups.push({
      id: 'tutorial',
      title: 'Getting Started',
      sections: tutorialSections,
    })
  } else {
    console.warn(`[docs:sync] TUTORIAL.md not found at ${TUTORIAL}`)
  }

  const apiSections = []
  if (existsSync(API_RST_DIR)) {
    const files = readdirSync(API_RST_DIR).filter((f) => f.endsWith('.rst') && f !== 'index.rst')
    for (const f of files.sort()) {
      const rst = readFileSync(join(API_RST_DIR, f), 'utf8')
      const titleLine = rst.split('\n')[0] || f
      const longTitle = titleLine.replace(/=+$/, '').trim() || f.replace(/\.rst$/, '')
      const title = shortApiNavTitle(longTitle, f)
      const slug = f.replace(/\.rst$/, '').replace(/[^a-z0-9]+/gi, '-').toLowerCase()
      const fname = `api--${slug}.md`
      const path = `markdown/${fname}`
      writeFileSync(join(MD_DIR, fname), wrapRstAsMarkdown(title, f, rst), 'utf8')
      apiSections.push({
        id: `api-${slug}`,
        title,
        path,
      })
    }
    groups.push({
      id: 'api',
      title: 'API reference (Sphinx sources)',
      sections: apiSections,
    })
  } else {
    console.warn(`[docs:sync] API RST dir not found: ${API_RST_DIR}`)
  }

  if (existsSync(EXAMPLES_DIR)) {
    try {
      const examplePages = buildExampleTutorialPages(SOURCE_ROOT)
      const exampleSections = []
      for (const page of examplePages) {
        writeFileSync(join(MD_DIR, page.fname), page.markdown + '\n', 'utf8')
        exampleSections.push({ id: page.id, title: page.title, path: page.path })
      }
      groups.push({
        id: 'examples',
        title: 'Example tutorials',
        sections: exampleSections,
      })
    } catch (e) {
      console.warn(`[docs:sync] Example tutorials skipped: ${e instanceof Error ? e.message : e}`)
    }
  } else {
    console.warn(`[docs:sync] examples/ not found at ${EXAMPLES_DIR}`)
  }

  const manifest = { version: 1, generated: new Date().toISOString(), sourceRoot: SOURCE_ROOT, groups }
  writeFileSync(join(OUT_DIR, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8')
  console.log(`[docs:sync] Wrote ${join(OUT_DIR, 'manifest.json')} and markdown under ${MD_DIR}`)
}

main()
