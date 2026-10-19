export type FactMode = 'light' | 'dark' | 'ocean'

/** What docs:data reads from the library for Home, the manifest and the Shiki contrast test. */
export interface LibraryFacts {
  /** Each mode's page background, as the hex the manifest and theme-color need. */
  page: Record<FactMode, string>
  /** CodeBlock's surface in each mode (neutral-solid), which Shiki's colours are measured against. */
  codeSurface: Record<FactMode, string>
  /** Dark mode's text, muted text and primary, for the Open Graph images and the icon, which no stylesheet reaches. */
  dark: { body: string; muted: string; primary: string }
  /** What the library's gates check today: harness pages (demos x modes x directions) and token pairs. */
  checks: { demos: number; modes: number; directions: number; pages: number; contrastPairs: number }
  /** Dialog's lines of the library's size-budget.json, which Home prints as the check behind the chip. */
  sizeBudget: string
}
