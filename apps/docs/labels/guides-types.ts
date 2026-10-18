import type { Mode } from './types'

/** The strings of the foundation pages' own pieces, beside SiteLabels so the shell's file stays as it is (docs-site rule 7). */
export interface GuideLabels {
  tokens: {
    swatch: string
    modes: Record<Mode, string>
    mix: (percent: number, of: string) => string
    contrast: (ratio: number, min: number) => string
    notMeasured: string
  }
  sample: { title: string }
  controls: {
    label: string
    radius: string
    density: string
    note: string
  }
  board: {
    label: string
    brand: string
    title: string
    lead: string
    save: string
    options: readonly [string, string, string]
  }
  icons: {
    search: (total: number) => string
    filter: string
    all: string
    directional: string
    solid: string
    results: (count: number) => string
    copy: (name: string) => string
    copied: (code: string) => string
    failed: string
  }
  island: {
    page: string
    scoped: string
    email: string
    save: string
  }
  pair: { ltr: string; rtl: string }
  kinds: (server: number, split: number, client: number, total: number) => string
  changelog: {
    empty: string
    /** Changesets writes its group headings in English; a locale may translate the ones it knows. */
    groups: Record<string, string>
    /** Said once above the entries when they stay in English inside another language's page. */
    entriesNote: string | null
  }
}
