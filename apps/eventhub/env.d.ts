/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** When EventHub runs on its own dev port, set to marketing origin (e.g. http://localhost:5173) so Docs / Mesh links work. Omit on unified deploy (use root-relative /docs). */
  readonly VITE_MARKETING_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
