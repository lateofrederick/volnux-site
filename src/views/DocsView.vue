<script setup lang="ts">
import DOMPurify from 'dompurify'
import hljs from 'highlight.js'
import MarkdownIt from 'markdown-it'
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { DocsManifest, DocsManifestSection } from '@/types/docs-manifest'

import 'highlight.js/styles/atom-one-dark.css'

const route = useRoute()
const router = useRouter()

const manifest = ref<DocsManifest | null>(null)
const loadError = ref<string | null>(null)
const contentError = ref<string | null>(null)
const renderedHtml = ref('')
const activeSectionId = ref('')
const loadingContent = ref(false)
const docsBodyRef = ref<HTMLElement | null>(null)

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

const flatSections = computed(() => {
  const m = manifest.value
  if (!m) return [] as (DocsManifestSection & { groupTitle: string })[]
  return m.groups.flatMap((g) => g.sections.map((s) => ({ ...s, groupTitle: g.title })))
})

const activeSection = computed(() => flatSections.value.find((s) => s.id === activeSectionId.value) ?? null)

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

/** Drop leading `# Title` when it repeats the sidebar / manifest title (avoids double h1 + extra rule). */
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

/** Atom One Dark expects `code.hljs`; markdown-it only adds `language-*`. */
function patchFenceHljsClass(html: string) {
  return html
    .replaceAll(/<pre><code class="language-([^"]+)">/g, '<pre><code class="hljs language-$1">')
    .replaceAll('<pre><code>', '<pre><code class="hljs">')
}

function wrapDocCodeBlocks(root: HTMLElement) {
  root.querySelectorAll('pre').forEach((pre) => {
    if (pre.closest('.docs-code-wrap')) return
    const wrap = document.createElement('div')
    wrap.className = 'docs-code-wrap'
    const btn = document.createElement('button')
    btn.type = 'button'
    btn.className = 'docs-code-copy'
    btn.setAttribute('aria-label', 'Copy code')
    btn.setAttribute('title', 'Copy code')
    btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>`
    pre.parentNode?.insertBefore(wrap, pre)
    wrap.appendChild(btn)
    wrap.appendChild(pre)
  })
}

function onDocsMarkdownClick(e: MouseEvent) {
  const btn = (e.target as HTMLElement).closest('button.docs-code-copy')
  if (!btn) return
  const wrap = btn.closest('.docs-code-wrap')
  const code = wrap?.querySelector('code')
  const text = code?.textContent ?? ''
  void navigator.clipboard?.writeText(text).then(() => {
    btn.classList.add('docs-code-copied')
    window.setTimeout(() => btn.classList.remove('docs-code-copied'), 2000)
  })
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
  try {
    const res = await fetch(`${docBase()}/docs/${section.path}`)
    if (!res.ok) throw new Error(`${section.path}: ${res.status}`)
    const text = await res.text()
    const body = stripDuplicateLeadingH1(text, section.title)
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
  activeSectionId.value = id
  const sec = flatSections.value.find((s) => s.id === id)
  if (sec) void loadSection(sec)
  if (pushHash) {
    router.replace({ path: '/docs', hash: `#${id}` })
  }
}

function resolveInitialSectionId(): string {
  const h = route.hash?.replace(/^#/, '')
  if (h && flatSections.value.some((s) => s.id === h)) return h
  return flatSections.value[0]?.id ?? ''
}

onMounted(async () => {
  await fetchManifest()
  const id = resolveInitialSectionId()
  if (id) selectSection(id, false)
  if (id && !route.hash) router.replace({ path: '/docs', hash: `#${id}` })
})

watch(
  () => route.hash,
  () => {
    const id = route.hash?.replace(/^#/, '')
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
  await nextTick()
  const root = docsBodyRef.value
  if (root) wrapDocCodeBlocks(root)
})
</script>

<template>
  <main id="docs-shell" class="scroll-pt-28 pb-24 pt-28 text-vn-text lg:scroll-pt-32 lg:pb-32 lg:pt-32">
    <div class="vn-container">
      <p v-if="loadError" class="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
        {{ loadError }}
      </p>

      <div
        v-else-if="manifest"
        class="grid gap-10 lg:grid-cols-[minmax(0,240px)_minmax(0,1fr)] lg:gap-12"
      >
        <aside class="lg:sticky lg:top-28 lg:self-start">
          <nav
            class="rounded-lg border border-vn-border bg-vn-surface/50 p-4 lg:border-0 lg:bg-transparent lg:p-0"
            aria-label="Documentation sections"
          >
            <div v-for="group in manifest.groups" :key="group.id" class="mb-8 last:mb-0">
              <p class="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-vn-muted2">
                {{ group.title }}
              </p>
              <ul class="list-none space-y-0.5 border-l border-vn-border2/80 pl-3">
                <li v-for="sec in group.sections" :key="sec.id">
                  <a
                    :href="`#${sec.id}`"
                    class="relative block rounded-md py-1.5 pl-2 text-[0.875rem] no-underline transition before:absolute before:left-[-13px] before:top-1/2 before:h-0 before:w-px before:-translate-y-1/2 before:bg-transparent before:transition-all hover:text-vn-text"
                    :class="
                      activeSectionId === sec.id
                        ? 'font-medium text-vn-accent before:!top-0 before:!h-full before:!-translate-y-0 before:!bg-vn-accent'
                        : 'text-vn-muted before:bg-vn-border2'
                    "
                    @click.prevent="selectSection(sec.id)"
                    >{{ sec.title }}</a
                  >
                </li>
              </ul>
            </div>
          </nav>
        </aside>

        <article class="min-w-0">
          <header v-if="activeSection" class="mb-8">
            <h1 class="font-display text-[clamp(1.65rem,3.5vw,2.25rem)] font-extrabold tracking-tight text-vn-white">
              {{ activeSection.title }}
            </h1>
          </header>

          <p v-if="contentError" class="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {{ contentError }}
          </p>
          <p v-else-if="loadingContent" class="text-vn-muted">Loading…</p>
          <div
            v-else
            ref="docsBodyRef"
            class="docs-md"
            v-html="renderedHtml"
            @click="onDocsMarkdownClick"
          />
        </article>
      </div>
    </div>
  </main>
</template>
