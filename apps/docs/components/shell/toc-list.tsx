'use client'

import { SHELL_EYEBROW, TOC_LINK } from '../classes'
import type { TocEntry } from './on-this-page'
import { useTocSpy } from './use-toc-spy'

/** The entries of On this page, the section being read marked: the first one in the server's HTML, then whichever the scroll reaches. */
export function TocList({ entries }: { entries: readonly TocEntry[] }) {
  const active = useTocSpy(entries)
  return (
    <ul className="flex flex-col gap-px text-xs">
      {entries.map((entry) => {
        const current = entry.id === active
        return (
          <li key={entry.id} className={entry.group === undefined ? undefined : 'mt-3 first:mt-0'}>
            {entry.group === undefined ? null : <p className={`mb-1 ${SHELL_EYEBROW}`}>{entry.group}</p>}
            <a href={`#${entry.id}`} aria-current={current ? 'location' : undefined} className={`${TOC_LINK[current ? 'current' : 'rest']} ${entry.count === undefined ? '' : 'w-full justify-between gap-2'}`}>
              {entry.text}
              {entry.count === undefined ? null : <span className="font-mono text-muted tabular-nums">{entry.count}</span>}
            </a>
          </li>
        )
      })}
    </ul>
  )
}
