// The /preview route's address space (S9): theme, direction, component and demo, all known at build time.
import { pagedComponents } from './components'

export const PREVIEW_THEMES = ['light', 'dark', 'ocean'] as const
export const PREVIEW_DIRS = ['ltr', 'rtl'] as const
export type PreviewDir = (typeof PREVIEW_DIRS)[number]

/** The language each direction stands for, as the library's harness has it. */
export const PREVIEW_LANG = { ltr: 'en', rtl: 'ar' } as const satisfies Record<PreviewDir, string>

/** The reserved empty page the size test subtracts from a demo's page. */
export const BLANK = { component: 'blank', demo: 'empty' } as const

export const isPreviewTheme = (value: string): value is (typeof PREVIEW_THEMES)[number] => (PREVIEW_THEMES as readonly string[]).includes(value)
export const isPreviewDir = (value: string): value is PreviewDir => (PREVIEW_DIRS as readonly string[]).includes(value)

/** Every demo of every component that has a page: the pages grow with the content files. */
export function previewDemos(): { component: string; demo: string }[] {
  return pagedComponents().flatMap((entry) => entry.demos.map((demo) => ({ component: entry.slug, demo: demo.name })))
}
