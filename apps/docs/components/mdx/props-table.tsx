import { Table } from 'topclassui/table'
import { getLabels } from 'topclassui/labels/get-labels'

import type { Locale } from '../../content/pages'
import type { SiteLabels } from '../../labels/index'
import { GUIDES, type ProviderPropRow } from '../../lib/data'
import { INLINE_CODE } from '../classes'

/** A props table from the component's own types, through the README generator (docs-site page 5). */
export function PropsTable({ locale, labels }: { of: 'TopClassProvider'; locale: Locale; labels: SiteLabels }) {
  const { prop, type, default: fallback, description, required } = labels.blocks.props
  const code = (text: string) => <code dir="ltr" className={INLINE_CODE}>{text}</code>
  return (
    <Table
      {...getLabels(locale)}
      items={GUIDES.provider}
      getKey={(row: ProviderPropRow) => row.name}
      caption={[prop, type, fallback, description].join(', ')}
      columns={[
        { key: 'prop', header: prop, rowHeader: true, cell: (row: ProviderPropRow) => code(row.name) },
        { key: 'type', header: type, className: 'whitespace-normal', cell: (row: ProviderPropRow) => code(row.type) },
        { key: 'default', header: fallback, className: 'whitespace-normal', cell: (row: ProviderPropRow) => (row.required ? required : code(row.default)) },
        { key: 'description', header: description, className: 'whitespace-normal', cell: (row: ProviderPropRow) => labels.providerProps[row.name] ?? '' },
      ]}
    />
  )
}
