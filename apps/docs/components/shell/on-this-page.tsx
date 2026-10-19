import { QUIET_LINK } from '../classes'

export interface TocEntry {
  text: string
  id: string
}

/** A server list of the page's `##` headings, sticky, hidden under 80rem. TODO(tc): TableOfContents with scroll-spy (choice 13). */
export function OnThisPage({ entries, label }: { entries: readonly TocEntry[]; label: string }) {
  if (entries.length === 0) return null
  return (
    <nav aria-label={label} className="sticky top-(--tc-sticky-top) hidden self-start max-h-[calc(100dvh-var(--tc-sticky-top))] overflow-y-auto overscroll-contain px-4 pt-9 pb-4 xl:block">
      <p className="mb-2.5 text-xs font-medium text-muted uppercase">{label}</p>
      <ul className="flex flex-col gap-px text-xs">
        {entries.map((entry) => (
          <li key={entry.id}>
            <a href={`#${entry.id}`} className={QUIET_LINK}>{entry.text}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
