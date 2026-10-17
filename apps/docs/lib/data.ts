// The site's one way into .generated/, which docs:data writes from the library (docs-site S7).
import components from '../.generated/components.json' with { type: 'json' }
import dates from '../.generated/dates.json' with { type: 'json' }
import guides from '../.generated/guides.json' with { type: 'json' }
import library from '../.generated/library.json' with { type: 'json' }
import toc from '../.generated/toc.json' with { type: 'json' }
import type { Locale } from '../content/pages'
import type { Rendering } from '../labels/index'
import type { LibraryFacts } from './library-facts'

export interface CardEntry {
  slug: string
  name: string
  status: string
  rendering: Rendering
  section: string | null
  order: number | null
}

interface TocEntry {
  text: string
  id: string
}

const entries = components.components as readonly (CardEntry & { card: boolean })[]

/** The 46 catalog cards in the catalog's section order. */
export const CARDS: readonly CardEntry[] = components.sections.flatMap((section) =>
  section.slugs.map((slug) => {
    const entry = entries.find((candidate) => candidate.slug === slug)
    if (entry === undefined) throw new Error(`components.json has no ${slug}`)
    return { slug: entry.slug, name: entry.name, status: entry.status, rendering: entry.rendering, section: entry.section, order: entry.order }
  }),
)

export const FACTS: LibraryFacts = library

export interface ProviderPropRow {
  name: string
  required: boolean
  type: string
  default: string
}

/** What the getting-started pages print from the library: the provider's props, the utility names, the theme script. */
export const GUIDES: {
  provider: readonly ProviderPropRow[]
  utilities: readonly { tokens: readonly string[]; utilities: readonly string[] }[]
  themeScript: string
  themeScriptHash: string
} = guides

export function cardBySlug(slug: string): CardEntry | undefined {
  return CARDS.find((card) => card.slug === slug)
}

export function tocOf(locale: Locale, page: string): readonly TocEntry[] {
  return (toc as Record<Locale, Record<string, TocEntry[] | undefined>>)[locale][page] ?? []
}

/** The newest commit date of a page's MDX in either locale; null for a page with no file. */
export function pageDate(page: string): string | null {
  return (dates.pages as Record<string, string | null | undefined>)[page] ?? null
}

export function componentDate(slug: string): string | null {
  return (dates.components as Record<string, string | null | undefined>)[slug] ?? null
}
