import { Table } from 'topclassui/table'
import { getLabels } from 'topclassui/labels/get-labels'

import type { Locale } from '../../content/pages'
import type { SiteLabels } from '../../labels/index'
import { GUIDES, type ProviderPropRow } from '../../lib/data'
import { defaultLines } from '../../lib/table-of'
import { DEFAULT_CODE, DEFAULT_LINE, PROSE_COLUMN, PROSE_TABLE, TABLE_CODE } from '../classes'

/** A props table from the component's own types, through the README generator (docs-site page 5). Every row shows: the page scrolls, not the table. */
export function PropsTable({ locale, labels }: { of: 'TopClassProvider'; locale: Locale; labels: SiteLabels }) {
  const { prop, type, default: fallback, description, required } = labels.blocks.props
  const code = (text: string) => <code dir="ltr" className={TABLE_CODE}>{text}</code>
  const lines = (text: string) => (
    <code dir="ltr" className={DEFAULT_CODE}>
      {defaultLines(text).map((line, at) => <span key={line} className={at === 0 ? DEFAULT_LINE.first : DEFAULT_LINE.rest}>{line}</span>)}
    </code>
  )
  return (
    <Table
      {...getLabels(locale)}
      items={GUIDES.provider}
      getKey={(row: ProviderPropRow) => row.name}
      caption={[prop, type, fallback, description].join(', ')}
      visibleRows={GUIDES.provider.length}
      className={PROSE_TABLE}
      columns={[
        { key: 'prop', header: prop, rowHeader: true, className: PROSE_COLUMN.fit, cell: (row: ProviderPropRow) => code(row.name) },
        { key: 'type', header: type, className: PROSE_COLUMN.wrap, cell: (row: ProviderPropRow) => code(row.type) },
        { key: 'default', header: fallback, className: PROSE_COLUMN.fit, cell: (row: ProviderPropRow) => (row.required ? required : lines(row.default)) },
        { key: 'description', header: description, className: PROSE_COLUMN.prose, cell: (row: ProviderPropRow) => labels.providerProps[row.name] ?? '' },
      ]}
    />
  )
}
