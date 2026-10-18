// The one generated component file (docs-site S7), typed: every page, card and preview reads it from here.
import data from '../.generated/components.json' with { type: 'json' }
import type { ComponentEntry, ComponentsFile } from '../scripts/lib/shape'

export type { ComponentEntry }
export type ComponentContent = NonNullable<ComponentEntry['content']>
export type Control = ComponentEntry['controls'][number]
export type PagedComponent = ComponentEntry & { content: ComponentContent }

const file = data as ComponentsFile

export const SECTIONS = file.sections
export const COMPONENTS = file.components

/** Every component with a page whose content file exists: what the routes are generated from. */
export function pagedComponents(): PagedComponent[] {
  return COMPONENTS.filter((entry): entry is PagedComponent => entry.page && entry.content !== null)
}

export function pagedComponentOf(slug: string): PagedComponent | null {
  return pagedComponents().find((entry) => entry.slug === slug) ?? null
}

export function sectionOf(entry: ComponentEntry): ComponentsFile['sections'][number] | null {
  return SECTIONS.find((section) => section.id === entry.section) ?? null
}

/** The source of one demo, already rewritten to the imports a reader writes. */
export function demoSourceOf(entry: ComponentEntry, name: string): string | null {
  return entry.demos.find((demo) => demo.name === name)?.source ?? null
}
