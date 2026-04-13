/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POINTY_URL?: string
  readonly VITE_EVENTHUB_URL?: string
  readonly VITE_MESH_URL?: string
  readonly VITE_CHANGELOG_URL?: string
}

declare module '*?raw' {
  const src: string
  export default src
}

declare module '*.html?raw' {
  const src: string
  export default src
}
