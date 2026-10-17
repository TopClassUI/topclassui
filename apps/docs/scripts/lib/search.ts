// The search index (docs-site S5): one JSON file per locale under public/search/, fetched on the palette's first open.
import type { ComponentsFile } from './shape.js'

export type SearchGroup = 'pages' | 'components' | 'icons'

export interface SearchEntry {
  group: SearchGroup
  /** What Command filters on, word by word: the title, and the Latin name when the title does not hold it as one word. */
  label: string
  /** What the row shows. */
  title: string
  /** The Latin name beside an Arabic or a reworded title; null when the title already says it. */
  hint: string | null
  href: string
}

/** A live page and its `##` headings, as the registry and toc.json give them. */
export interface SearchPage {
  title: string
  href: string
  headings: readonly { id: string; text: string }[]
}

/** Every page, every heading of a page, every component page and every icon of one locale, in that order. */
export function searchIndexOf(file: ComponentsFile, locale: 'en' | 'ar', pages: readonly SearchPage[], icons: readonly SearchPage[] = []): SearchEntry[] {
  const entry = (group: SearchGroup, title: string, href: string, hint: string | null = null): SearchEntry => ({
    group, label: hint === null ? title : `${title} ${hint}`, title, hint, href,
  })
  const pageEntries = pages.flatMap((page) => [
    entry('pages', page.title, page.href),
    ...page.headings.map((heading) => entry('pages', `${page.title}: ${heading.text}`, `${page.href}#${heading.id}`)),
  ])
  const components = file.components.flatMap((component) => {
    if (!component.page || component.content === null) return []
    const title = component.content.title[locale]
    const hint = title.toLowerCase().includes(component.name.toLowerCase()) ? null : component.name
    return [entry('components', title, `/${locale}/docs/components/${component.slug}`, hint)]
  })
  return [...pageEntries, ...components, ...icons.map((icon) => entry('icons', icon.title, icon.href))]
}
