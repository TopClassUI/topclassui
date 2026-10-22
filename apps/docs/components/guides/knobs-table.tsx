import type { ReactNode } from 'react'

import type { Locale } from '../../content/pages'
import { knobDefault } from '../../lib/guides'
import { tableOf } from '../../lib/table-of'
import { textOf } from '../../lib/text-of'
import { TABLE_CODE } from '../classes'
import { DataTable } from './data-table'

/** Theming's knobs as written, with the Default column read from tokens.css, so the page cannot drift from the library (docs-site page 9). */
export function KnobsTable({ children, locale }: { children?: ReactNode; locale: Locale }) {
  const { header, rows } = tableOf(children)
  const filled = rows.map(([knob, , ...rest]) => [knob, <code key="default" dir="ltr" className={TABLE_CODE}>{knobDefault(textOf(knob).trim())}</code>, ...rest])
  return <DataTable header={header} rows={filled} locale={locale} />
}
