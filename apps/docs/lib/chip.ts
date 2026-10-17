// The one chip wording (docs-site S8): the kind from meta.ts, and no number until pnpm size exists (choice 15).
export type Rendering = 'server' | 'split' | 'client'

export interface ChipLabels {
  notMeasured: string
  lazy: string
}

/** Loaded on first use, so the chip says so. */
export const LAZY_SLUGS: readonly string[] = ['command', 'date-picker']

export function chipOf(rendering: Rendering, slug: string, labels: ChipLabels): string {
  const size = rendering === 'server' ? '0 KB' : labels.notMeasured
  const lazy = LAZY_SLUGS.includes(slug) ? `, ${labels.lazy}` : ''
  return `${rendering} - ${size}${lazy}`
}
