// Props (page 14, section 4): one server Table per part, generated (S7). Names and types stay Latin.
import { Table } from 'topclassui/table'

import { COMPONENT_PAGE_LABELS } from '../../labels/component-page'
import type { PagedComponent } from '../../lib/components'
import type { Locale } from '../../lib/locales'
import { CARD_TITLE, PROSE } from '../classes'
import { InlineText } from '../inline-text'

type Row = PagedComponent['props'][number]['rows'][number]

const limitsOf = (row: Row) => {
  if (row.min === null && row.max === null) return '-'
  return [row.min === null ? null : `min ${String(row.min)}`, row.max === null ? null : `max ${String(row.max)}`]
    .filter((part) => part !== null).join(', ')
}

const latin = (text: string) => <span dir="ltr"><InlineText text={text} /></span>

export function PropsTables({ entry, locale }: { entry: PagedComponent; locale: Locale }) {
  const t = COMPONENT_PAGE_LABELS[locale]
  const many = entry.props.length > 1
  return entry.props.map((part) => (
    <div key={part.name} className="grid min-w-0 gap-2">
      {many ? <h3 dir="ltr" className={`${CARD_TITLE} text-start font-mono`}>{part.name}</h3> : null}
      {part.rows.length === 0 ? <p className={PROSE}>{t.noProps}</p> : (
        <Table
          caption={t.table.caption(part.name)}
          items={part.rows}
          getKey={(row) => row.name}
          columns={[
            { key: 'prop', header: t.table.prop, rowHeader: true, cell: (row) => <code dir="ltr">{row.required ? `${row.name}*` : row.name}</code> },
            { key: 'type', header: t.table.type, cell: (row) => latin(row.type), className: 'whitespace-normal min-w-40' },
            { key: 'default', header: t.table.default, cell: (row) => latin(row.default) },
            { key: 'limits', header: t.table.limits, cell: (row) => <span dir="ltr">{limitsOf(row)}</span> },
            { key: 'description', header: t.table.description, cell: (row) => <span dir="auto"><InlineText text={row.description} /></span>, className: 'whitespace-normal min-w-60' },
          ]}
        />
      )}
    </div>
  ))
}
