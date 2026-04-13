<script setup lang="ts">
import { computed } from 'vue'
import hljs from 'highlight.js'

const props = defineProps<{
  language: string
  code: string
}>()

/** Map UI labels / odd strings to highlight.js language ids. */
function hljsLanguageId(raw: string): string {
  const s = raw.trim().toLowerCase()
  if (!s) return 'plaintext'
  const first = s.split(/[\s—–-]/)[0] ?? s
  if (first === 'py' || first.startsWith('python')) return 'python'
  if (first.includes('pointy')) return 'javascript'
  if (first === 'ts' || first === 'typescript') return 'typescript'
  if (first === 'js' || first === 'javascript') return 'javascript'
  if (first === 'json') return 'json'
  if (first === 'yaml' || first === 'yml') return 'yaml'
  if (first === 'bash' || first === 'shell' || first === 'sh' || first === 'zsh') return 'bash'
  if (first === 'sql') return 'sql'
  if (first === 'toml') return 'ini'
  if (first === 'text' || first === 'plain' || first === 'txt') return 'plaintext'
  if (hljs.getLanguage(first)) return first
  return 'plaintext'
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

const highlightedHtml = computed(() => {
  const code = props.code
  const lang = hljsLanguageId(props.language)
  try {
    if (lang !== 'plaintext' && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value
    }
  } catch {
    /* fall through */
  }
  try {
    return hljs.highlightAuto(code).value
  } catch {
    return escapeHtml(code)
  }
})

async function copyCode() {
  await navigator.clipboard.writeText(props.code)
}
</script>

<template>
  <div class="code-block">
    <div class="code-bar">
      <span class="cd cd-r"></span>
      <span class="cd cd-y"></span>
      <span class="cd cd-g"></span>
      <span class="code-lang">{{ language }}</span>
      <button type="button" class="code-copy" title="Copy" aria-label="Copy code" @click="copyCode">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <rect x="2" y="4" width="9" height="9" rx="1.5" stroke="currentColor" stroke-width="1.2" />
          <path
            d="M4 4V3a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H10"
            stroke="currentColor"
            stroke-width="1.2"
          />
        </svg>
      </button>
    </div>
    <pre class="code-body"><code class="hljs" v-html="highlightedHtml"></code></pre>
  </div>
</template>
