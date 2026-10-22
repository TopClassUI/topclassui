import type { ReactNode } from 'react'
import { BORDER, BORDER_WIDTH } from 'topclassui/classes'

import type { Locale } from '../../content/pages'
import { guideLabelsFor } from '../../labels/guides'
import type { Shade } from '../../lib/guide-facts'
import { tokenFact, tokenNameOf } from '../../lib/guides'
import type { FactMode } from '../../lib/library-facts'
import { tableOf } from '../../lib/table-of'
import { textOf } from '../../lib/text-of'
import { DataTable } from './data-table'

const MODES = ['light', 'dark', 'ocean'] as const satisfies readonly FactMode[]

function tokenOfRow(cells: readonly ReactNode[]): string {
  for (const cell of cells) {
    const name = tokenNameOf(textOf(cell))
    if (name !== null) return name
  }
  throw new Error(`no colour token in the row "${cells.map(textOf).join(' | ')}"`)
}

/** Every class as the author wrote it, each row checked against a token docs:data measured (docs-site page 7). */
export function TokenTable({ children, locale }: { children?: ReactNode; locale: Locale }) {
  const { header, rows } = tableOf(children)
  for (const cells of rows) tokenFact(tokenOfRow(cells))
  return <DataTable header={header} rows={rows} locale={locale} head="code" />
}

/** The six tones as the frame draws them: a live swatch, the role, its shade and contrast in the page's mode, and what it is for. */
export function ToneTable({ children, locale }: { children?: ReactNode; locale: Locale }) {
  const labels = guideLabelsFor(locale).tokens
  const { rows } = tableOf(children)
  const shade = (value: Shade) => (value.kind === 'shade' ? value.name : value.kind === 'mix' ? labels.mix(value.percent, value.of) : value.text)
  return (
    <ul className={`flex flex-col overflow-hidden rounded-box bg-surface ${BORDER}`}>
      {rows.map(([role, use]) => {
        const token = tokenOfRow([role])
        const fact = tokenFact(token)
        return (
          <li key={token} className={`grid grid-cols-[auto_1fr] items-center gap-x-3 gap-y-1 border-t-(length:--tc-line-width) border-line px-3.5 py-2.5 first:border-t-0 sm:grid-cols-[auto_12rem_11rem_1fr]`}>
            <span aria-hidden="true" style={{ '--tc-swatch': `var(${token})` }} className={`row-span-3 size-7.5 rounded-chip bg-(--tc-swatch) sm:row-span-1 ${BORDER_WIDTH} border-line`} />
            <code dir="ltr" className="text-start font-mono text-xs text-body">{textOf(role)}</code>
            <span dir="ltr" className="text-start font-mono text-xs text-muted">
              {MODES.map((mode) => {
                const measured = fact.contrast?.[mode]
                return (
                  <span key={mode} data-shade={mode} className="flex-col">
                    <span>{shade(fact.shade[mode])}</span>
                    {measured === undefined ? null : <span className="font-sans">{labels.contrast(measured.ratio, measured.min)}</span>}
                  </span>
                )
              })}
            </span>
            <span className="text-xs text-muted">{use}</span>
          </li>
        )
      })}
    </ul>
  )
}
