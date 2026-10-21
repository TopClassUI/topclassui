// The one generated component file (docs-site S7), typed: every page, card and preview reads it from here.
import data from '../.generated/components.json' with { type: 'json' }
import type { ComponentEntry, ComponentsFile } from '../scripts/lib/shape'

export type { ComponentEntry }
export type ComponentContent = NonNullable<ComponentEntry['content']>
export type Control = ComponentEntry['controls'][number]
export type PagedComponent = ComponentEntry & { content: ComponentContent }

const file = data as ComponentsFile

/** The pages whose demos define a Server Action: each has a route of its own, so the client code of those demos stays on that page. */
export const ACTION_ROUTES = ['dropdown'] as const

export const SECTIONS = file.sections
export const COMPONENTS = file.components

/** Every component with a page whose content file exists: what the routes are generated from. */
export function pagedComponents(): PagedComponent[] {
  return COMPONENTS.filter((entry): entry is PagedComponent => entry.page && entry.content !== null)
}

export function pagedComponentOf(slug: string): PagedComponent | null {
  return pagedComponents().find((entry) => entry.slug === slug) ?? null
}

/** Every component page in reading order: the catalog's sections, then the pages with no card. */
export function componentOrder(): PagedComponent[] {
  const paged = pagedComponents()
  const carded = SECTIONS.flatMap((section) => section.slugs)
  return [
    ...carded.flatMap((slug) => paged.filter((entry) => entry.slug === slug)),
    ...paged.filter((entry) => !carded.includes(entry.slug)),
  ]
}

/** The component pages before and after one, in reading order. */
export function componentNeighbours(slug: string): { previous: PagedComponent | undefined; next: PagedComponent | undefined } {
  const order = componentOrder()
  const index = order.findIndex((entry) => entry.slug === slug)
  return index === -1 ? { previous: undefined, next: undefined } : { previous: order[index - 1], next: order[index + 1] }
}

export function sectionOf(entry: ComponentEntry): ComponentsFile['sections'][number] | null {
  return SECTIONS.find((section) => section.id === entry.section) ?? null
}

/** The source of one demo, already rewritten to the imports a reader writes. */
export function demoSourceOf(entry: ComponentEntry, name: string): string | null {
  return entry.demos.find((demo) => demo.name === name)?.source ?? null
}
