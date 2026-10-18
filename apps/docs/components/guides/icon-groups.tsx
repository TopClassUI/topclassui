import type { ReactNode } from 'react'

import type { Locale } from '../../content/pages'
import { GUIDES } from '../../lib/guides'
import { tableOf } from '../../lib/table-of'
import { DataTable } from './data-table'

/** The set's groups in docs/icons.md order, with each count read from that file; the rows' words are the page's own. */
export function IconGroups({ children, locale }: { children?: ReactNode; locale: Locale }) {
  const { header, rows } = tableOf(children)
  const { groups } = GUIDES.icons
  if (rows.length !== groups.length) throw new Error(`the Icons page lists ${String(rows.length)} groups, docs/icons.md has ${String(groups.length)}`)
  const filled = rows.map(([group, , ...rest], index) => [group, String(groups[index]?.names.length ?? 0), ...rest])
  return <DataTable header={header} rows={filled} locale={locale} />
}
