import type { ReactNode } from 'react'
import { BORDER_STRONG } from 'topclassui/classes'
import { Table } from 'topclassui/table'
import { getLabels } from 'topclassui/labels/get-labels'

import type { Locale } from '../../content/pages'
import { guideLabelsFor } from '../../labels/guides'
import type { Shade } from '../../lib/guide-facts'
import { tokenFact, tokenNameOf } from '../../lib/guides'
import type { FactMode } from '../../lib/library-facts'
import { captionOf, tableOf } from '../../lib/table-of'
import { textOf } from '../../lib/text-of'

const MODES = ['light', 'dark', 'ocean'] as const satisfies readonly FactMode[]

interface Row {
  key: string
  token: string
  cells: ReactNode[]
}

function tokenOfRow(cells: readonly ReactNode[]): string {
  for (const cell of cells) {
    const name = tokenNameOf(textOf(cell))
    if (name !== null) return name
  }
  throw new Error(`no colour token in the row "${cells.map(textOf).join(' | ')}"`)
}

/** A Colors table as the author wrote it, with a live swatch and each mode's shade and measured contrast added (docs-site page 7). */
export function TokenTable({ children, locale }: { children?: ReactNode; locale: Locale }) {
  const labels = guideLabelsFor(locale).tokens
  const { header, rows } = tableOf(children)
  const items: Row[] = rows.map((cells) => ({ key: tokenOfRow(cells), token: tokenOfRow(cells), cells }))
  const shade = (value: Shade) => (value.kind === 'shade' ? value.name : value.kind === 'mix' ? labels.mix(value.percent, value.of) : value.text)
  const modeHeaders = MODES.map((mode) => labels.modes[mode])
  return (
    <Table
      {...getLabels(locale)}
      items={items}
      getKey={(item) => item.key}
      caption={captionOf([...header, ...modeHeaders])}
      columns={[
        {
          key: 'swatch',
          header: labels.swatch,
          cell: (item: Row) => (
            <span aria-hidden="true" style={{ '--tc-swatch': `var(${item.token})` }} className={`inline-block size-6 rounded-chip bg-(--tc-swatch) align-middle ${BORDER_STRONG}`} />
          ),
        },
        ...header.map((cell, column) => ({
          key: `own-${String(column)}`,
          header: cell,
          rowHeader: column === 0,
          className: 'whitespace-normal',
          cell: (item: Row) => item.cells[column],
        })),
        ...MODES.map((mode) => ({
          key: mode,
          header: labels.modes[mode],
          className: 'whitespace-normal min-w-32',
          cell: (item: Row) => {
            const fact = tokenFact(item.token)
            const measured = fact.contrast?.[mode]
            return (
              <span className="flex flex-col gap-0.5">
                <code dir="ltr" className="font-mono text-sm text-body">{shade(fact.shade[mode])}</code>
                <span className="text-xs text-muted">{measured === undefined ? labels.notMeasured : labels.contrast(measured.ratio, measured.min)}</span>
              </span>
            )
          },
        })),
      ]}
    />
  )
}
