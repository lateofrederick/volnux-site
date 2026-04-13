export interface DocsManifestSection {
  id: string
  title: string
  path: string
}

export interface DocsManifestGroup {
  id: string
  title: string
  sections: DocsManifestSection[]
}

export interface DocsManifest {
  version: number
  generated: string
  sourceRoot: string
  groups: DocsManifestGroup[]
}
