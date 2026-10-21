import { SCROLL_AREA } from 'topclassui/classes'

import { SHELL_EYEBROW } from '../classes'
import { TocList } from './shell-islands'

export interface TocEntry {
  text: string
  id: string
}

/** The page's `##` headings, sticky, hidden under 80rem; the list loads its scroll spy once it is in view. TODO(tc): TableOfContents (choice 13). */
export function OnThisPage({ entries, label }: { entries: readonly TocEntry[]; label: string }) {
  if (entries.length === 0) return null
  return (
    <nav aria-label={label} className={`sticky top-(--tc-sticky-top) hidden self-start max-h-[calc(100dvh-var(--tc-sticky-top))] px-4 pt-9 pb-4 xl:block ${SCROLL_AREA}`}>
      <p className={`mb-2.5 ${SHELL_EYEBROW}`}>{label}</p>
      <TocList entries={entries} />
    </nav>
  )
}
