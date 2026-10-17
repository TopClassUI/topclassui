// The strings of the search button and its palette (S5), in en and ar.
import type { Locale } from '../lib/locales'
import type { SearchGroup } from '../scripts/lib/search'

export interface SearchLabels {
  button: string
  /** The palette's dialog title, which names it. */
  title: string
  placeholder: string
  groups: Record<SearchGroup, string>
  shortcut: { pc: string; mac: string }
}

const en: SearchLabels = {
  button: 'Search',
  title: 'Search the docs',
  placeholder: 'Search pages and components',
  groups: { pages: 'Pages', components: 'Components', icons: 'Icons' },
  shortcut: { pc: 'Ctrl K', mac: '⌘ K' },
}

const ar: SearchLabels = {
  button: 'ابحث في التوثيق',
  title: 'ابحث في التوثيق',
  placeholder: 'ابحث في الصفحات والمكوّنات',
  groups: { pages: 'الصفحات', components: 'المكوّنات', icons: 'الأيقونات' },
  shortcut: { pc: 'Ctrl K', mac: '⌘ K' },
}

export const SEARCH_LABELS: Record<Locale, SearchLabels> = { en, ar }
