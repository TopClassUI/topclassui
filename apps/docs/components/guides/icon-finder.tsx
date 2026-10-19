'use client'

import type { ReactNode } from 'react'
import { BORDER, FOCUS_RING, HOVER, TOUCH_TARGET, TRANSITION } from 'topclassui/classes'
import { Input } from 'topclassui/input'
import { SegmentedControlItem, SegmentedControlRoot } from 'topclassui/segmented-control'

import type { Locale } from '../../content/pages'
import { guideLabelsFor } from '../../labels/guides'
import type { IconFact } from '../../lib/guide-facts'
import { ICON_FILTERS, useIconFinder } from './use-icon-finder'

export interface IconFinderProps {
  icons: readonly (IconFact & { glyph: ReactNode })[]
  /** The locale, not its labels: a label that counts is a function, and a function cannot cross to the client. */
  locale: Locale
}

const TILE = `flex w-full min-w-0 flex-col items-center gap-2 rounded-control ${BORDER} bg-page px-2 py-3 text-body ${HOVER.ghost} ${TRANSITION} ${FOCUS_RING} ${TOUCH_TARGET}`

/** The client half of the Icons grid: the tiles arrive drawn by the server; this hides them and copies their code. */
export function IconFinder({ icons, locale }: IconFinderProps) {
  const labels = guideLabelsFor(locale).icons
  const finder = useIconFinder(icons, labels)
  const names = { all: labels.all, directional: labels.directional, solid: labels.solid }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Input type="search" aria-label={labels.search(icons.length)} placeholder={labels.search(icons.length)} value={finder.query} onChange={(event) => { finder.search(event.target.value) }} />
        <SegmentedControlRoot aria-label={labels.filter} value={finder.filter} onValueChange={finder.pick} size="sm">
          {ICON_FILTERS.map((value) => <SegmentedControlItem key={value} value={value}>{names[value]}</SegmentedControlItem>)}
        </SegmentedControlRoot>
        <p role="status" className="ms-auto text-sm text-muted">{finder.message ?? labels.results(finder.shown.size)}</p>
      </div>
      <ul className={`grid grid-cols-2 gap-1.5 rounded-box bg-surface p-4 sm:grid-cols-4 lg:grid-cols-6 ${BORDER}`}>
        {icons.map((icon) => (
          <li key={icon.name} hidden={!finder.shown.has(icon.name)} className="flex min-w-0">
            <button type="button" className={TILE} aria-label={icon.directional ? `${labels.copy(icon.name)}, ${labels.directional}` : labels.copy(icon.name)} onClick={() => { finder.copy(icon.name) }}>
              <span aria-hidden="true" className={icon.directional ? 'text-xl text-warning-on-soft' : 'text-xl'}>{icon.glyph}</span>
              <code dir="ltr" className="max-w-full truncate font-mono text-xs text-muted">{icon.name}</code>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
