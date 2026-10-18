import type { FactMode } from './library-facts'

/** What a token resolves to in one mode: a palette shade, a mix of a tone into the page, or a literal value. */
export type Shade =
  | { kind: 'shade'; name: string }
  | { kind: 'mix'; percent: number; of: string }
  | { kind: 'value'; text: string }

/** The pair a token is measured in by the library's contrast check, worst reading over the surfaces it can sit on. */
export interface Measured {
  ratio: number
  min: number
}

export interface TokenFact {
  shade: Record<FactMode, Shade>
  contrast: Record<FactMode, Measured> | null
}

export interface IconGroup {
  title: string
  names: string[]
}

export interface IconFact {
  name: string
  directional: boolean
  solid: boolean
}

/** What docs:data reads from the library for Colors, Icons and Theming (docs-site pages 7, 8 and 9). */
export interface GuideFacts {
  /** Every colour token the two Colors tables name, keyed by its variable. */
  tokens: Record<string, TokenFact>
  /** The knobs on :root, as tokens.css declares them. */
  knobs: Record<string, string>
  /** The source of a mode's block in tokens.css, as a reader would copy it. */
  modeBlocks: Record<'dark' | 'ocean', string>
  icons: { total: number; directional: number; groups: IconGroup[]; all: IconFact[] }
}

export interface ChangelogItem {
  text: string
  children: string[]
}

export interface ChangelogGroup {
  /** The Changesets heading ("Minor Changes"), or null for lines straight under the version. */
  title: string | null
  items: ChangelogItem[]
}

export interface Release {
  version: string
  groups: ChangelogGroup[]
}

/** packages/topclassui/CHANGELOG.md, parsed; `releases` is empty when the file does not exist yet. */
export interface ChangelogFacts {
  releases: Release[]
}
