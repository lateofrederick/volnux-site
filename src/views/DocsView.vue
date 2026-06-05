<script setup lang="ts">
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import MarkdownIt from 'markdown-it'
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { DocsManifest, DocsManifestSection } from '@/types/docs-manifest'
import { transformSphinxApiMarkdown } from '@/utils/sphinxApiToMarkdown'

import 'highlight.js/styles/atom-one-dark.css'

const route = useRoute()
const router = useRouter()

/* ── State ── */
const manifest = ref<DocsManifest | null>(null)
const loadError = ref<string | null>(null)
const contentError = ref<string | null>(null)
const renderedHtml = ref('')
const activeSectionId = ref('')
const loadingContent = ref(false)
const docsBodyRef = ref<HTMLElement | null>(null)
const searchQuery = ref('')
const mobileMenuOpen = ref(false)
const readingProgress = ref(0)
const collapsedGroups = ref<Set<string>>(new Set())
const tocItems = ref<{ id: string; text: string; depth: number }[]>([])
const activeTocId = ref('')

/* ── Group icons ── */
const groupIcons: Record<string, string> = {
  tutorial: '📘',
  api: '📚',
  examples: '🧪',
}

/* ── Markdown setup ── */
const md = new MarkdownIt({
  html: false,
  linkify: true,
  typographer: true,
  breaks: true,
})
md.set({
  highlight(str, lang) {
    const name = (lang || '').trim()
    if (name && hljs.getLanguage(name)) {
      try {
        return hljs.highlight(str, { language: name, ignoreIllegals: true }).value
      } catch {
        /* fall through */
      }
    }
    return md.utils.escapeHtml(str)
  },
})

/* ── Computed ── */
const flatSections = computed(() => {
  const m = manifest.value
  if (!m) return [] as (DocsManifestSection & { groupTitle: string; groupId: string })[]
  return m.groups.flatMap((g) =>
    g.sections.map((s) => ({ ...s, groupTitle: g.title, groupId: g.id })),
  )
})

const activeSection = computed(
  () => flatSections.value.find((s) => s.id === activeSectionId.value) ?? null,
)

const activeSectionIndex = computed(() =>
  flatSections.value.findIndex((s) => s.id === activeSectionId.value),
)

const prevSection = computed(() => {
  const idx = activeSectionIndex.value
  return idx > 0 ? flatSections.value[idx - 1] : null
})

const nextSection = computed(() => {
  const idx = activeSectionIndex.value
  return idx >= 0 && idx < flatSections.value.length - 1 ? flatSections.value[idx + 1] : null
})

const isApiReferencePage = computed(() => activeSection.value?.id.startsWith('api-') ?? false)

const isIntroPage = computed(() => activeSection.value?.id === 'tutorial-introduction')

const filteredGroups = computed(() => {
  const m = manifest.value
  if (!m) return []
  const q = searchQuery.value.toLowerCase().trim()
  if (!q) return m.groups
  return m.groups
    .map((g) => ({
      ...g,
      sections: g.sections.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          g.title.toLowerCase().includes(q),
      ),
    }))
    .filter((g) => g.sections.length > 0)
})

const hasToc = computed(() => tocItems.value.length > 2)

/* ── Helpers ── */
function docBase() {
  const b = import.meta.env.BASE_URL || '/'
  return b.endsWith('/') ? b.slice(0, -1) : b
}

function enrichExternalLinks(html: string) {
  return html.replaceAll('<a href="http', '<a target="_blank" rel="noopener noreferrer" href="http')
}

function sanitizeHtml(html: string) {
  return DOMPurify.sanitize(enrichExternalLinks(html), {
    USE_PROFILES: { html: true },
  })
}

function stripDuplicateLeadingH1(markdown: string, sectionTitle: string): string {
  const want = sectionTitle.trim().toLowerCase().replace(/\s+/g, ' ')
  if (!want) return markdown
  const lines = markdown.split('\n')
  const first = (lines[0] ?? '').trim()
  const m = first.match(/^#\s+(.+)$/)
  if (!m) return markdown
  const got = m[1].trim().toLowerCase().replace(/\s+/g, ' ')
  if (got !== want) return markdown
  lines.shift()
  while (lines.length > 0 && lines[0].trim() === '') lines.shift()
  return lines.join('\n')
}

function patchFenceHljsClass(html: string) {
  return html
    .replaceAll(/<pre><code class="language-([^"]+)">/g, '<pre><code class="hljs language-$1">')
    .replaceAll('<pre><code>', '<pre><code class="hljs">')
}

// function detectLanguage(pre: HTMLPreElement): string {
//   const code = pre.querySelector('code')
//   if (!code) return ''
//   const cls = Array.from(code.classList).find((c) => c.startsWith('language-'))
//   return cls ? cls.replace('language-', '') : ''
// }

function wrapDocCodeBlocks(root: HTMLElement) {
  root.querySelectorAll('pre').forEach((pre) => {
    if (pre.closest('.docs-code-wrap')) return

    // Trim trailing newlines from code element to make the block nicely compact
    const code = pre.querySelector('code')
    if (code) {
      code.innerHTML = code.innerHTML.replace(/\n+$/, '')
    }

    const wrap = document.createElement('div')
    wrap.className = 'docs-code-wrap'

    const copyBtn = document.createElement('button')
    copyBtn.type = 'button'
    copyBtn.className = 'docs-code-copy'
    copyBtn.setAttribute('aria-label', 'Copy code')
    copyBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg><span>Copy</span>`

    pre.parentNode?.insertBefore(wrap, pre)
    wrap.appendChild(copyBtn)
    wrap.appendChild(pre)
  })
}

function extractToc(root: HTMLElement) {
  const headings = root.querySelectorAll('h2, h3')
  const items: { id: string; text: string; depth: number }[] = []
  headings.forEach((h, i) => {
    const text = h.textContent?.trim() || ''
    if (!text) return
    let id = h.id
    if (!id) {
      id = `heading-${text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${i}`
      h.id = id
    }
    items.push({ id, text, depth: h.tagName === 'H3' ? 3 : 2 })
  })
  tocItems.value = items
}

function onDocsMarkdownClick(e: MouseEvent) {
  const btn = (e.target as HTMLElement).closest('button.docs-code-copy')
  if (!btn) return
  const wrap = btn.closest('.docs-code-wrap')
  const code = wrap?.querySelector('code')
  const text = code?.textContent ?? ''
  const span = btn.querySelector('span')
  void navigator.clipboard?.writeText(text).then(() => {
    btn.classList.add('copied')
    if (span) span.textContent = 'Copied!'
    window.setTimeout(() => {
      btn.classList.remove('copied')
      if (span) span.textContent = 'Copy'
    }, 2000)
  })
}

function copyInstallCommand() {
  void navigator.clipboard?.writeText('pip install volnux')
}

/* ── Scroll / progress tracking ── */
function onScroll() {
  const scrollTop = window.scrollY
  const docHeight = document.documentElement.scrollHeight - window.innerHeight
  readingProgress.value = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0

  // ToC tracking
  if (!tocItems.value.length) return
  let currentId = tocItems.value[0]?.id ?? ''
  for (const item of tocItems.value) {
    const el = document.getElementById(item.id)
    if (el) {
      const rect = el.getBoundingClientRect()
      if (rect.top <= 120) currentId = item.id
    }
  }
  activeTocId.value = currentId
}

function scrollToTocItem(id: string) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

/* ── Sidebar ── */
function toggleGroup(groupId: string) {
  const s = new Set(collapsedGroups.value)
  if (s.has(groupId)) {
    s.delete(groupId)
  } else {
    s.add(groupId)
  }
  collapsedGroups.value = s
}

function toggleMobileMenu() {
  mobileMenuOpen.value = !mobileMenuOpen.value
  document.body.style.overflow = mobileMenuOpen.value ? 'hidden' : ''
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
  document.body.style.overflow = ''
}

/* ── Data loading ── */
function normalizeDocsHashId(id: string): string {
  if (id === 'api-index') return 'api-backend'
  return id
}

async function fetchManifest() {
  loadError.value = null
  try {
    const res = await fetch(`${docBase()}/docs/manifest.json`)
    if (!res.ok) throw new Error(`manifest ${res.status}`)
    manifest.value = (await res.json()) as DocsManifest
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : 'Failed to load docs manifest'
    manifest.value = null
  }
}

async function loadSection(section: DocsManifestSection) {
  contentError.value = null
  loadingContent.value = true
  renderedHtml.value = ''
  tocItems.value = []
  try {
    const res = await fetch(`${docBase()}/docs/${section.path}`)
    if (!res.ok) throw new Error(`${section.path}: ${res.status}`)
    const text = await res.text()
    let body = stripDuplicateLeadingH1(text, section.title)
    if (section.id.startsWith('api-')) {
      body = transformSphinxApiMarkdown(body)
    }
    renderedHtml.value = sanitizeHtml(patchFenceHljsClass(md.render(body)))
    await nextTick()
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  } catch (e) {
    contentError.value = e instanceof Error ? e.message : 'Failed to load page'
  } finally {
    loadingContent.value = false
  }
}

function selectSection(id: string, pushHash = true) {
  const nid = normalizeDocsHashId(id)
  activeSectionId.value = nid
  const sec = flatSections.value.find((s) => s.id === nid)
  if (sec) void loadSection(sec)
  if (pushHash) {
    router.replace({ path: '/docs', hash: `#${nid}` })
  }
  closeMobileMenu()
}

function resolveInitialSectionId(): string {
  const h = route.hash?.replace(/^#/, '')
  const want = h ? normalizeDocsHashId(h) : ''
  if (want && flatSections.value.some((s) => s.id === want)) return want
  return flatSections.value[0]?.id ?? ''
}

/* ── Keyboard shortcuts ── */
function onKeyDown(e: KeyboardEvent) {
  // Cmd/Ctrl + K to focus search
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault()
    const input = document.querySelector('.docs-search input') as HTMLInputElement | null
    input?.focus()
  }
}

/* ── Lifecycle ── */
onMounted(async () => {
  await fetchManifest()
  const rawHash = route.hash?.replace(/^#/, '')
  if (rawHash === 'api-index') {
    await router.replace({ path: '/docs', hash: '#api-backend' })
  }
  const id = resolveInitialSectionId()
  if (id) selectSection(id, false)
  if (id && !route.hash) router.replace({ path: '/docs', hash: `#${id}` })

  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
  window.removeEventListener('keydown', onKeyDown)
  document.body.style.overflow = ''
})

watch(
  () => route.hash,
  () => {
    const id = normalizeDocsHashId(route.hash?.replace(/^#/, '') ?? '')
    if (!id || !manifest.value) return
    if (flatSections.value.some((s) => s.id === id) && id !== activeSectionId.value) {
      activeSectionId.value = id
      const sec = flatSections.value.find((s) => s.id === id)
      if (sec) void loadSection(sec)
    }
  },
)

watch(renderedHtml, async () => {
  if (!renderedHtml.value) return
  // Double nextTick: first tick updates v-html, second ensures ref is assigned
  await nextTick()
  await nextTick()
  const root = docsBodyRef.value
  if (root) {
    wrapDocCodeBlocks(root)
    extractToc(root)
  }
})

// Also watch loadingContent -> false as a fallback to ensure DOM manipulation runs
watch(loadingContent, async (newVal, oldVal) => {
  if (oldVal && !newVal && renderedHtml.value) {
    await nextTick()
    await nextTick()
    const root = docsBodyRef.value
    if (root) {
      wrapDocCodeBlocks(root)
      extractToc(root)
    }
  }
})
</script>

<template>
  <main id="docs-shell" class="docs-shell">
    <!-- Reading Progress Bar -->
    <div class="docs-progress">
      <div class="docs-progress-bar" :style="{ width: readingProgress + '%' }" />
    </div>

    <!-- Load error -->
    <div v-if="loadError" class="vn-container" style="padding-top: 2rem;">
      <div style="padding: 1rem 1.25rem; background: var(--docs-error-bg); border: 1px solid var(--docs-error-border); border-radius: 10px; color: var(--docs-error-text); font-size: 0.875rem;">
        {{ loadError }}
      </div>
    </div>

  <!-- Main Grid -->
  <div v-else-if="manifest" class="docs-grid" :class="{ 'has-toc': hasToc }">
    <!-- Sidebar -->
    <aside class="docs-sidebar" :class="{ 'mobile-open': mobileMenuOpen }">
      <!-- Search -->
      <div class="docs-search">
        <svg class="docs-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search docs..."
          aria-label="Search documentation"
        />
        <span class="docs-search-shortcut">⌘K</span>
      </div>

      <!-- Nav Groups -->
      <nav aria-label="Documentation navigation">
        <div v-for="group in filteredGroups" :key="group.id" class="docs-nav-group">
          <div class="docs-nav-group-header" @click="toggleGroup(group.id)">
            <span class="docs-nav-group-icon">{{ groupIcons[group.id] || '📄' }}</span>
            <span class="docs-nav-group-title">{{ group.title }}</span>
            <svg class="docs-nav-group-chevron" :class="{ collapsed: collapsedGroups.has(group.id) }" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>

          <div
            class="docs-nav-group-items"
            :class="{ collapsed: collapsedGroups.has(group.id) }"
            :style="{ maxHeight: collapsedGroups.has(group.id) ? '0' : (group.sections.length * 42 + 16) + 'px' }"
          >
            <a
              v-for="sec in group.sections"
              :key="sec.id"
              :href="`#${sec.id}`"
              class="docs-nav-item"
              :class="{ active: activeSectionId === sec.id }"
              @click.prevent="selectSection(sec.id)"
            >
              {{ sec.title }}
            </a>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Content -->
    <article class="docs-content" :class="{ 'docs-api-page': isApiReferencePage }">
        <!-- Hero Banner (intro page only) -->
        <div v-if="isIntroPage && !loadingContent" class="docs-hero">
          <div class="docs-hero-badge">
            <span class="docs-hero-badge-dot" />
            Documentation
          </div>
          <h2>Get started with Volnux</h2>
          <p>
            Build resilient, event-driven pipelines with a declarative DSL. Define workflows with Pointy-Lang, leverage hybrid concurrency, and scale with distributed processing.
          </p>
          <div class="docs-hero-install">
            <span class="prompt">$</span>
            <span>pip install volnux</span>
            <button type="button" aria-label="Copy install command" title="Copy" @click="copyInstallCommand">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            </button>
          </div>
          <div class="docs-hero-links">
            <a class="docs-hero-link" href="#tutorial-pipeline" @click.prevent="selectSection('tutorial-pipeline')">
              Pipeline Guide
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </a>
            <a class="docs-hero-link" href="#example-simple" @click.prevent="selectSection('example-simple')">
              Quick Example
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </a>
          </div>
        </div>

        <!-- Breadcrumb -->
        <nav v-if="activeSection" class="docs-breadcrumb" aria-label="Breadcrumb">
          <span class="docs-breadcrumb-item">Docs</span>
          <span class="docs-breadcrumb-separator">/</span>
          <span class="docs-breadcrumb-item">{{ activeSection.groupTitle }}</span>
          <span class="docs-breadcrumb-separator">/</span>
          <span class="docs-breadcrumb-item current">{{ activeSection.title }}</span>
        </nav>

        <!-- Content Header -->
        <header v-if="activeSection" class="docs-content-header">
          <h1>{{ activeSection.title }}</h1>
        </header>

        <hr class="docs-content-divider" />

        <!-- Content Error -->
        <div v-if="contentError" style="padding: 1rem 1.25rem; background: var(--docs-error-bg); border: 1px solid var(--docs-error-border); border-radius: 10px; color: var(--docs-error-text); font-size: 0.875rem;">
          {{ contentError }}
        </div>

        <!-- Loading Skeleton -->
        <div v-else-if="loadingContent" class="docs-skeleton">
          <div class="docs-skeleton-line" style="width: 45%" />
          <div class="docs-skeleton-line" />
          <div class="docs-skeleton-line" />
          <div class="docs-skeleton-block" />
          <div class="docs-skeleton-line" />
          <div class="docs-skeleton-line" />
          <div class="docs-skeleton-line" style="width: 75%" />
        </div>

        <!-- Rendered Markdown -->
        <div
          v-else
          ref="docsBodyRef"
          class="docs-md"
          v-html="renderedHtml"
          @click="onDocsMarkdownClick"
        />

        <!-- Previous / Next Navigation -->
        <div v-if="!loadingContent && (prevSection || nextSection)" class="docs-nav-footer">
          <a
            v-if="prevSection"
            :href="`#${prevSection.id}`"
            class="docs-nav-footer-link prev"
            @click.prevent="selectSection(prevSection.id)"
          >
            <span class="docs-nav-footer-label">← Previous</span>
            <span class="docs-nav-footer-title">{{ prevSection.title }}</span>
          </a>
          <div v-else />

          <a
            v-if="nextSection"
            :href="`#${nextSection.id}`"
            class="docs-nav-footer-link next"
            @click.prevent="selectSection(nextSection.id)"
          >
            <span class="docs-nav-footer-label">Next →</span>
            <span class="docs-nav-footer-title">{{ nextSection.title }}</span>
          </a>
          <div v-else />
        </div>
      </article>

    <!-- On This Page (ToC Rail) -->
    <aside v-if="hasToc" class="docs-toc">
      <div class="docs-toc-title">On this page</div>
      <a
        v-for="item in tocItems"
        :key="item.id"
        class="docs-toc-item"
        :class="[
          { active: activeTocId === item.id },
          item.depth === 3 ? 'depth-3' : ''
        ]"
        :href="`#${item.id}`"
        @click.prevent="scrollToTocItem(item.id)"
      >
        {{ item.text }}
      </a>
    </aside>
  </div>

  <!-- Mobile sidebar toggle -->
    <button class="docs-mobile-toggle" aria-label="Toggle documentation menu" @click="toggleMobileMenu">
      <svg v-if="!mobileMenuOpen" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M4 6h16M4 12h16M4 18h16" />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </button>

    <!-- Mobile backdrop -->
    <div
      class="docs-mobile-backdrop"
      :class="{ visible: mobileMenuOpen }"
      @click="closeMobileMenu"
    />
  </main>
</template>
