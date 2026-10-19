// The one chip wording (docs-site S8): the kind from meta.ts and the own client bytes pnpm size measured (choice 15).
export type Rendering = 'server' | 'split' | 'client'

export interface ChipLabels {
  lazy: string
}

export interface Chipped {
  rendering: Rendering
  slug: string
  /** size.json's own gzip bytes, null for a server component. */
  clientBytes: number | null
}

/** Loaded on first use, so the chip says so. */
export const LAZY_SLUGS: readonly string[] = ['command', 'date-picker']

/** One decimal of 1024 bytes, as pnpm size prints it. */
export function kbOf(bytes: number): string {
  return `${(Math.round((bytes / 1024) * 10) / 10).toFixed(1)} KB`
}

export function chipOf({ rendering, slug, clientBytes }: Chipped, labels: ChipLabels): string {
  const lazy = LAZY_SLUGS.includes(slug) ? `, ${labels.lazy}` : ''
  if (rendering === 'server') return `server - 0 KB${lazy}`
  if (clientBytes === null) throw new Error(`${slug} is ${rendering} but size.json has no number for it`)
  const size = rendering === 'split' ? `0 KB server + ${kbOf(clientBytes)} client` : kbOf(clientBytes)
  return `${rendering} - ${size}${lazy}`
}
