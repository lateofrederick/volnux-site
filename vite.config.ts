import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import Markdown from 'unplugin-vue-markdown/vite'
import hljs from 'highlight.js'

// Register Pointy Lang
hljs.registerLanguage('pointy', (hljsAPI) => ({
  name: 'Pointy Lang',
  aliases: ['pty', 'pointy'],
  contains: [
    hljsAPI.HASH_COMMENT_MODE,
    {
      className: 'keyword',
      begin: /@[a-zA-Z0-9_]+/
    },
    {
      className: 'variable',
      begin: /\$[a-zA-Z0-9_.]+/
    },
    {
      className: 'operator',
      begin: /->|\|->|\|\||\*|::|\?\?|\?/
    },
    {
      className: 'string',
      begin: /"[^"]*"/
    },
    {
      className: 'number',
      begin: /\b\d+(\.\d+)?\b/
    },
    {
      className: 'title.class',
      begin: /\b[A-Z][a-zA-Z0-9_]*\b/
    },
    {
      className: 'built_in',
      begin: /<[A-Z]+/
    }
  ]
}))

export default defineConfig({
  plugins: [
    vue({
      include: [/\.vue$/, /\.md$/],
    }),
    Markdown({
      markdownItOptions: {
        html: true,
        linkify: true,
        typographer: true,
      },
      markdownItSetup(md) {
        md.options.highlight = (str, lang) => {
          const name = (lang || '').trim()
          if (name === 'mermaid') {
            return `<pre class="mermaid-raw" style="display:none">${md.utils.escapeHtml(str)}</pre>`
          }
          if (name && hljs.getLanguage(name)) {
            try {
              return hljs.highlight(str, { language: name, ignoreIllegals: true }).value
            } catch {
              /* fall through */
            }
          }
          return md.utils.escapeHtml(str)
        }
      },
    }),
  ],
  server: {
    port: 5173,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
