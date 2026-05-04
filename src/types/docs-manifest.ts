export interface DocsManifestSection {
  id: string
  title: string
  path: string
  description?: string
}

export interface DocsManifestGroup {
  id: string
  title: string
  sections: DocsManifestSection[]
  icon?: string
  description?: string
}

export interface DocsManifest {
  version: number
  generated: string
  sourceRoot: string
  groups: DocsManifestGroup[]
}
