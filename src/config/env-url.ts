/**
 * Normalise Vite `import.meta.env` string values (trim, strip quotes, validate).
 * Empty, "undefined", or non-http(s) values return ''.
 */
export function parseViteExternalUrl(raw: string | undefined): string {
  let v = (raw ?? '').trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim()
  }
  if (!v || v === 'undefined' || v === 'null') return ''
  if (!/^https?:\/\//i.test(v)) return ''
  return v.replace(/\/$/, '')
}

/** Use absolute URL from env when valid; otherwise internal path (SPA route). */
export function productHref(envVal: string | undefined, fallbackPath: string): string {
  const ext = parseViteExternalUrl(envVal)
  return ext || fallbackPath
}

export function isAbsoluteHttpUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim())
}
