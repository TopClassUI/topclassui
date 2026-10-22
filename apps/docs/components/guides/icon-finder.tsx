'use client'

import type { ReactNode } from 'react'
import { BORDER, FOCUS_RING, HOVER, ICON_BUTTON, TOUCH_TARGET, TRANSITION } from 'topclassui/classes'
import { magnifyingGlass } from 'topclassui/icons/magnifying-glass'
import { x } from 'topclassui/icons/x'
import { Input } from 'topclassui/input'
import { SegmentedControlItem, SegmentedControlRoot } from 'topclassui/segmented-control'
import { Svg } from 'topclassui/svg'

import type { Locale } from '../../content/pages'
import { guideLabelsFor } from '../../labels/guides'
import type { IconFact } from '../../lib/guide-facts'
import { ICON_FILTERS, useIconFinder } from './use-icon-finder'

export interface IconFinderProps {
  icons: readonly (IconFact & { glyph: ReactNode })[]
  /** The locale, not its labels: a label that counts is a function, and a function cannot cross to the client. */
  locale: Locale
}

const TILE = `flex w-full min-w-0 flex-col items-center gap-2.5 rounded-[0.625rem] border-(length:--tc-line-width) border-dashed border-line px-1.5 pt-4 pb-3.5 text-body ${HOVER.ghost} ${TRANSITION} ${FOCUS_RING} ${TOUCH_TARGET}`

/** The frame's filter: three chips apart, the chosen one on the primary tint; the library control keeps its radio keys. */
const CHIPS = 'gap-1.5 border-transparent bg-transparent p-0'
const CHIP = `border-(length:--tc-line-width) border-line px-3 py-1.75 text-sm text-muted data-checked:border-transparent data-checked:bg-primary-soft data-checked:text-primary-on-soft data-checked:shadow-none`

/** The client half of the Icons grid: the tiles arrive drawn by the server; this hides them and copies their code. */
export function IconFinder({ icons, locale }: IconFinderProps) {
  const labels = guideLabelsFor(locale).icons
  const finder = useIconFinder(icons, labels)
  const names = { all: labels.all, directional: labels.directional, solid: labels.solid }
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-80 max-w-full">
          <Svg icon={magnifyingGlass} size="0.875rem" aria-hidden="true" className="pointer-events-none absolute inset-s-3.5 top-1/2 -translate-y-1/2 text-muted" />
          <Input type="search" aria-label={labels.search(icons.length)} placeholder={labels.search(icons.length)} value={finder.query} onChange={(event) => { finder.search(event.target.value) }} className="w-full ps-9 pe-9 placeholder:text-body [&::-webkit-search-cancel-button]:appearance-none" />
          {finder.query === '' ? null : (
            <button type="button" aria-label={labels.clear} onClick={() => { finder.search('') }} className={`absolute inset-e-1.5 top-1/2 -translate-y-1/2 text-muted ${ICON_BUTTON} ${HOVER.ghost}`}>
              <Svg icon={x} size="0.875rem" aria-hidden="true" />
            </button>
          )}
        </div>
        <SegmentedControlRoot aria-label={labels.filter} value={finder.filter} onValueChange={finder.pick} size="custom" className={CHIPS}>
          {ICON_FILTERS.map((value) => <SegmentedControlItem key={value} value={value} className={CHIP}>{names[value]}</SegmentedControlItem>)}
        </SegmentedControlRoot>
        <p role="status" className="ms-auto text-sm text-muted">{finder.message ?? labels.results(finder.shown.size)}</p>
      </div>
      <ul className={`grid grid-cols-2 gap-2 rounded-box bg-surface p-4.5 sm:grid-cols-4 lg:grid-cols-6 ${BORDER}`}>
        {icons.map((icon) => (
          <li key={icon.name} hidden={!finder.shown.has(icon.name)} className="flex min-w-0">
            <button type="button" className={TILE} aria-label={icon.directional ? `${labels.copy(icon.name)}, ${labels.directional}` : labels.copy(icon.name)} onClick={() => { finder.copy(icon.name) }}>
              <span aria-hidden="true" className={icon.directional ? 'text-2xl text-warning-on-soft' : 'text-2xl'}>{icon.glyph}</span>
              <code dir="ltr" className="max-w-full truncate font-mono text-[0.6875rem] text-muted">{icon.name}</code>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
