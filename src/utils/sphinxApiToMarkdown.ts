/**
 * Convert Sphinx-style API text (embedded in markdown ~~~text fences) into
 * readable markdown styled similarly to Saleor API reference pages.
 */

/** Strip BOM, CR, trailing whitespace — fixes Windows CRLF breaking `$/` regex matches on directives. */
function normLine(line: string): string {
  return line.replace(/^\uFEFF/, '').replace(/\r$/, '').trimEnd()
}

function leadingWs(line: string): number {
  const m = normLine(line).match(/^ */)
  return m ? m[0].length : 0
}

function isModuleLevelDirective(line: string): boolean {
  return /^\.\. py:(class|function|data)::/.test(normLine(line))
}

function isDecorativeRstLine(line: string): boolean {
  const t = normLine(line).trim()
  if (!t) return false
  if (/^[=~\-_]+$/.test(t) && t.length >= 3) return true
  return false
}

/**
 * Sphinx leaf headings: a title line at column 0 followed by a line of ~, =, or -.
 * These appear before `.. py:class::` and must not be merged into the previous class body
 * (otherwise they leak into Parameters prose as raw text).
 */
function isRstLeafHeadingPair(lines: string[], j: number): boolean {
  const a = normLine(lines[j] ?? '')
  const b = normLine(lines[j + 1] ?? '')
  if (!a.trim() || !b.trim()) return false
  if (leadingWs(a) !== 0) return false
  if (/^\.\. py:/.test(a)) return false
  if (a.trim().startsWith(':')) return false
  if (/^\*\*.+\*\*$/.test(a.trim())) return false
  return isDecorativeRstLine(b)
}

function cleanPreamble(raw: string): string {
  const lines = raw.split('\n')
  const out: string[] = []
  for (let i = 0; i < lines.length; i++) {
    const L = lines[i]
    const t = L.trim()
    if (isDecorativeRstLine(L)) continue
    if (t && i + 1 < lines.length && isDecorativeRstLine(lines[i + 1])) {
      i++
      continue
    }
    out.push(L)
  }
  const text = out.join('\n').trim()
  if (!text) return ''
  return `${text}\n\n---\n\n`
}

interface ParamField {
  name: string
  desc: string
  type?: string
}

function parseRstFieldBlock(text: string): { prose: string; params: ParamField[] } {
  const lines = text.split('\n')
  const params: ParamField[] = []
  const proseLines: string[] = []
  let i = 0

  while (i < lines.length) {
    const L = normLine(lines[i])
    const paramM = L.match(/^\s*:param\s+([^:]+):\s*(.*)$/)
    const typeM = L.match(/^\s*:type\s+([^:]+):\s*(.*)$/)
    const retM = L.match(/^\s*:return:\s*(.*)$/)
    const rtypeM = L.match(/^\s*:rtype:\s*(.*)$/)

    if (paramM) {
      params.push({ name: paramM[1].trim(), desc: paramM[2].trim() })
      i++
      continue
    }
    if (typeM) {
      const name = typeM[1].trim()
      const typ = typeM[2].trim()
      const last = params[params.length - 1]
      if (last && last.name === name) last.type = typ
      i++
      continue
    }
    if (retM) {
      proseLines.push(`**Returns:** ${retM[1].trim()}`)
      i++
      continue
    }
    if (rtypeM) {
      proseLines.push(`**Return type:** \`${rtypeM[1].trim()}\``)
      i++
      continue
    }
    if (isDecorativeRstLine(L)) {
      i++
      continue
    }
    if (leadingWs(L) === 0 && L.trim() && !L.startsWith(':') && !L.startsWith('..')) {
      break
    }
    proseLines.push(L)
    i++
  }

  return { prose: proseLines.join('\n').trim(), params }
}

/** Bullet list (avoids GFM table edge cases after fenced code blocks in markdown-it). */
function formatParamsAsBullets(params: ParamField[]): string {
  if (!params.length) return ''
  return (
    params
      .map((p) => {
        const typ = p.type ? ` · \`${p.type.replace(/`/g, "'")}\`` : ''
        return `- **\`${p.name.replace(/`/g, "'")}\`**${typ} — ${p.desc}`
      })
      .join('\n') + '\n\n'
  )
}

function formatMethodOrAttr(
  kind: 'method' | 'attribute' | 'property' | 'classmethod',
  signature: string,
  body: string,
): string {
  const { prose, params } = parseRstFieldBlock(body)
  const sig = signature.trim()
  const kindLabel =
    kind === 'method' || kind === 'classmethod'
      ? kind === 'classmethod'
        ? 'classmethod'
        : 'method'
      : kind
  let md = `#### \`${sig}\` · _${kindLabel}_\n\n`
  md += '```python\n' + sig + '\n```\n\n'
  if (prose) md += prose + '\n\n'
  if (params.length) md += '**Parameters**\n\n' + formatParamsAsBullets(params)
  return md
}

function parseIndentedDirective(
  lines: string[],
  start: number,
  pattern: RegExp,
): { match: RegExpMatchArray; indent: number; end: number } | null {
  for (let j = start; j < lines.length; j++) {
    const Ln = normLine(lines[j])
    const m = Ln.match(pattern)
    if (m) return { match: m, indent: leadingWs(Ln), end: j }
  }
  return null
}

function collectBodyAfterDirective(lines: string[], dirLineIndex: number, dirIndent: number): { text: string; nextLine: number } {
  const body: string[] = []
  let j = dirLineIndex + 1
  while (j < lines.length) {
    const L = normLine(lines[j])
    if (L.trim() === '') {
      body.push('')
      j++
      continue
    }
    const ind = leadingWs(L)
    if (ind <= dirIndent) {
      const isSiblingDirective =
        /^\s*\.\. py:(class|method|attribute|property|classmethod|function|data)::/.test(L) && ind === dirIndent
      const isSection = /^\s*\*\*.+:\*\*/.test(L) && ind === dirIndent
      if (isSiblingDirective || isSection) break
    }
    if (ind <= dirIndent && isModuleLevelDirective(lines[j])) break
    if (isRstLeafHeadingPair(lines, j)) break
    const raw = lines[j]
    const dedent = raw.length ? normLine(raw).slice(Math.min(ind, dirIndent + 3)) : raw
    body.push(dedent)
    j++
  }
  return { text: body.join('\n').trim(), nextLine: j }
}

function formatClassBody(className: string, bodyLines: string[], depth: number): string {
  const bl = bodyLines.map(normLine)
  const h = Math.min(2 + depth, 6)
  const hash = '#'.repeat(h)
  let i = 0
  const desc: string[] = []
  while (i < bl.length) {
    const L = bl[i]
    const t = L.trim()
    if (t.startsWith('**') && t.endsWith('**')) break
    if (/^\s*\.\. py:(class|method|attribute|property|classmethod)::/.test(L)) break
    if (L.startsWith('   ') || (L.trim() === '' && desc.length)) {
      desc.push(L.startsWith('   ') ? L.slice(3) : '')
      i++
      continue
    }
    if (!t) {
      i++
      continue
    }
    break
  }

  let md = `${hash} ${className}\n\n`
  const d = desc.join('\n').trim()
  if (d) md += d + '\n\n'
  md += '```python\nclass ' + className + '\n```\n\n'

  while (i < bl.length) {
    const L = bl[i]
    const sectionM = L.match(/^(\s*)\*\*(.+):\*\*\s*$/)
    if (sectionM) {
      const title = sectionM[2].trim()
      const sectionIndent = leadingWs(L)
      i++
      md += `${'#'.repeat(Math.min(h + 1, 6))} ${title}\n\n`

      let jPeek = i
      while (jPeek < bl.length && !bl[jPeek].trim()) jPeek++
      const peek = bl[jPeek] ?? ''
      const treatAsParamTable = title === 'Parameters' || /^\s*:param\s/.test(peek)

      if (treatAsParamTable) {
        const paramLines: string[] = []
        while (i < bl.length) {
          const K = bl[i]
          const Kn = normLine(K)
          if (/^\s*\*\*.+:\*\*/.test(Kn) && leadingWs(Kn) === sectionIndent) break
          if (/^\s*\.\. py:/.test(Kn)) break
          if (isModuleLevelDirective(K)) break
          if (Kn.trim() === '') {
            paramLines.push(K)
            i++
            continue
          }
          if (isDecorativeRstLine(Kn)) break
          if (leadingWs(Kn) === 0 && !Kn.startsWith(':') && !Kn.startsWith('..')) {
            break
          }
          paramLines.push(K)
          i++
        }
        const block = paramLines.join('\n')
        const { prose, params } = parseRstFieldBlock(block)
        if (params.length) md += formatParamsAsBullets(params)
        if (prose) md += prose + '\n\n'
      }
      continue
    }

    if (
      leadingWs(L) === 0 &&
      L.trim() &&
      i + 1 < bl.length &&
      isDecorativeRstLine(bl[i + 1]) &&
      !/^\.\. py:/.test(L) &&
      !L.trim().startsWith(':') &&
      !/^\*\*.+\*\*$/.test(L.trim())
    ) {
      md += `## ${L.trim()}\n\n`
      i += 2
      while (i < bl.length && isDecorativeRstLine(bl[i])) i++
      continue
    }

    const nestedClass = parseIndentedDirective(bl, i, /^(\s*)\.\. py:class:: (.+)$/)
    if (nestedClass) {
      const name = nestedClass.match[2].trim()
      const { text, nextLine } = collectBodyAfterDirective(
        bl,
        nestedClass.end,
        nestedClass.indent,
      )
      const nestedLines = text ? text.split('\n').map(normLine) : []
      md += formatClassBody(name, nestedLines, depth + 1)
      i = nextLine
      continue
    }

    const attr = parseIndentedDirective(bl, i, /^(\s*)\.\. py:attribute:: (.+)$/)
    if (attr) {
      const sig = attr.match[2].trim()
      const { text, nextLine } = collectBodyAfterDirective(bl, attr.end, attr.indent)
      md += formatMethodOrAttr('attribute', sig, text)
      i = nextLine
      continue
    }

    const prop = parseIndentedDirective(bl, i, /^(\s*)\.\. py:property:: (.+)$/)
    if (prop) {
      const sig = prop.match[2].trim()
      const { text, nextLine } = collectBodyAfterDirective(bl, prop.end, prop.indent)
      md += formatMethodOrAttr('property', sig, text)
      i = nextLine
      continue
    }

    const cm = parseIndentedDirective(bl, i, /^(\s*)\.\. py:classmethod:: (.+)$/)
    if (cm) {
      const sig = cm.match[2].trim()
      const { text, nextLine } = collectBodyAfterDirective(bl, cm.end, cm.indent)
      md += formatMethodOrAttr('classmethod', sig, text)
      i = nextLine
      continue
    }

    const meth = parseIndentedDirective(bl, i, /^(\s*)\.\. py:method:: (.+)$/)
    if (meth) {
      const sig = meth.match[2].trim()
      const { text, nextLine } = collectBodyAfterDirective(bl, meth.end, meth.indent)
      md += formatMethodOrAttr('method', sig, text)
      i = nextLine
      continue
    }

    if (L.startsWith('   ') && L.trim() && !/^\s*\.\. py:/.test(L)) {
      const proseLines: string[] = []
      while (i < bl.length) {
        const K = bl[i]
        if (K.trim() === '') {
          proseLines.push('')
          i++
          continue
        }
        if (!K.startsWith('   ')) break
        if (/^\s*\.\. py:/.test(K)) break
        if (/^\s*\*\*.+:\*\*/.test(K)) break
        proseLines.push(K.slice(3))
        i++
      }
      const p = proseLines.join('\n').trim()
      if (p) md += p + '\n\n'
      continue
    }

    if (L.trim() === '') {
      i++
      continue
    }

    i++
  }

  return md
}

function formatFunctionOrData(kind: 'function' | 'data', nameSig: string, bodyLines: string[]): string {
  const md = `## ${nameSig}\n\n`
  const { prose, params } = parseRstFieldBlock(bodyLines.join('\n'))
  const fence = kind === 'function' ? 'def ' + nameSig.split('(')[0] + '(...)' : nameSig
  let out = md + '```python\n' + fence + '\n```\n\n'
  if (prose) out += prose + '\n\n'
  if (params.length) out += '**Parameters**\n\n' + formatParamsAsBullets(params)
  return out
}

function parseModuleChunkSimple(chunkLines: string[]): string {
  const first = normLine(chunkLines[0] ?? '')
  const mFn = first.match(/^\.\. py:function::\s*(.+)$/)
  if (mFn) {
    const { text } = collectBodyAfterDirective(chunkLines, 0, 0)
    return formatFunctionOrData('function', mFn[1].trim(), text ? text.split('\n') : [])
  }
  const mData = first.match(/^\.\. py:data::\s*(.+)$/)
  if (mData) {
    const { text } = collectBodyAfterDirective(chunkLines, 0, 0)
    return formatFunctionOrData('data', mData[1].trim(), text ? text.split('\n') : [])
  }
  const mClass = first.match(/^\.\. py:class::\s*(.+)$/)
  if (mClass) {
    const className = mClass[1].trim()
    const { text } = collectBodyAfterDirective(chunkLines, 0, 0)
    const rest = text ? text.split('\n') : []
    return formatClassBody(className, rest, 0)
  }
  return '```text\n' + chunkLines.join('\n') + '\n```\n'
}

function sliceModuleChunkFixed(lines: string[], start: number): { chunk: string[]; next: number } {
  const chunk: string[] = []
  let j = start
  if (j >= lines.length) return { chunk, next: j }
  chunk.push(lines[j++])
  while (j < lines.length) {
    const L = lines[j]
    if (isModuleLevelDirective(normLine(L))) break
    chunk.push(L)
    j++
  }
  return { chunk, next: j }
}

function parseAllModuleChunksFixed(inner: string): string {
  const lines = inner.split('\n').map(normLine)
  let i = 0
  while (i < lines.length && !isModuleLevelDirective(lines[i])) i++

  const preamble = cleanPreamble(lines.slice(0, i).join('\n'))
  let md = preamble
  while (i < lines.length) {
    if (!isModuleLevelDirective(lines[i])) {
      const t = normLine(lines[i])
      const u = normLine(lines[i + 1] ?? '')
      if (
        t &&
        u &&
        isDecorativeRstLine(lines[i + 1]) &&
        /^[A-Za-z0-9]/.test(t) &&
        t.length < 80 &&
        !t.startsWith('..') &&
        !t.includes(':')
      ) {
        let k2 = i + 2
        while (k2 < lines.length && isDecorativeRstLine(lines[k2])) k2++
        while (k2 < lines.length && normLine(lines[k2]) === '') k2++
        const nxt = normLine(lines[k2] ?? '')
        const mcls = nxt.match(/^\.\. py:class::\s*(.+)$/)
        const titleWord = t.split(/\s+/)[0]
        const classWord = mcls ? mcls[1].trim().split(/[\s(]/)[0] : ''
        if (!mcls || classWord !== titleWord) {
          md += `## ${t}\n\n`
        }
        i = i + 2
        while (i < lines.length && isDecorativeRstLine(lines[i])) i++
        continue
      }
      i++
      continue
    }
    const { chunk, next } = sliceModuleChunkFixed(lines, i)
    md += parseModuleChunkSimple(chunk)
    i = next
  }
  return md
}

/**
 * If `raw` is API markdown with a leading `~~~text` Sphinx fence, returns Saleor-style markdown.
 * Otherwise returns `raw` unchanged.
 */
export function transformSphinxApiMarkdown(raw: string): string {
  const t = raw.trimStart().replace(/^\uFEFF/, '').replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const lines = t.split('\n').map(normLine)
  if (!lines[0]?.match(/^~{3,}text\s*$/)) return raw
  let end = lines.length - 1
  while (end > 0 && lines[end] === '') end--
  if (end < 1 || !lines[end].match(/^~{3,}\s*$/)) return raw
  const inner = lines.slice(1, end).join('\n')
  return parseAllModuleChunksFixed(inner)
}
