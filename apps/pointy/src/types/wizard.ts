export type EventSource = 'pypi' | 'hub' | 'git' | 'local'

export interface PaletteEventDef {
  type: string
  cat: string
  source: EventSource
  color: string
  icon: string
  sub: string
}

export interface PaletteSectionDef {
  id: string
  title: string
  events: PaletteEventDef[]
}

export interface WizardNode {
  id: string
  type: string
  cat: string
  source: EventSource
  color: string
  x: number
  y: number
  annotation: string
  version: string
  executor: string
  retry: number
}

export interface WizardEdge {
  id: string
  from: string
  to: string
}

export interface EdgePath {
  id: string
  d: string
  mx: number
  my: number
}
