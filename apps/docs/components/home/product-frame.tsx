import { Badge } from 'topclassui/badge'
import { Button } from 'topclassui/button'
import { BORDER } from 'topclassui/classes'
import { Icon } from 'topclassui/icon'
import { Input } from 'topclassui/input'
import { getLabels } from 'topclassui/labels/get-labels'
import { Pagination } from 'topclassui/pagination'
import { Table } from 'topclassui/table'

import type { Locale } from '../../content/pages'
import type { Rendering, SiteLabels } from '../../labels'
import { kbOf } from '../../lib/chip'
import { CARDS, cardBySlug, componentDate, type CardEntry } from '../../lib/data'
import { ZERO_KB } from '../../lib/site'

const ROWS = ['button', 'select', 'date-picker', 'input', 'tag', 'table', 'dialog'] as const
export const KIND_TONE = { server: 'success', split: 'primary', client: 'info' } as const satisfies Record<Rendering, string>

/** "Sep 2026" in the page's language, with Latin digits as the rest of the prose (docs-site S10). */
function monthOf(date: string | null, locale: Locale): string {
  if (date === null) return '-'
  return new Intl.DateTimeFormat(`${locale}-u-nu-latn`, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(date))
}

/** A dashboard drawn from the library, server HTML and nothing that hydrates: Home's LCP candidate (docs-site page 1). */
export function ProductFrame({ locale, labels }: { locale: Locale; labels: SiteLabels }) {
  const frame = labels.home.frame
  const library = getLabels(locale)
  const rows = ROWS.map((slug) => cardBySlug(slug)).filter((entry): entry is CardEntry => entry !== undefined)
  return (
    <figure className="flex flex-col gap-3">
      <div inert className={`flex overflow-hidden rounded-box bg-surface text-start ${BORDER}`}>
        <ul className="hidden w-52 shrink-0 flex-col gap-1 border-e border-line p-3 text-sm md:flex">
          <li className="px-2 py-1.5 font-semibold text-body">{labels.meta.siteName}</li>
          {frame.sidebar.map((item, index) => (
            <li key={item} className={index === 1 ? 'rounded-control bg-primary-soft px-2 py-1.5 text-primary-on-soft' : 'px-2 py-1.5 text-muted'}>{item}</li>
          ))}
        </ul>
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="text-xl font-semibold text-body">{frame.title}</p>
              <p className="text-sm text-muted">{frame.count(CARDS.length)}</p>
            </div>
            <Input type="search" size="sm" aria-label={frame.search} placeholder={frame.search} className="max-md:hidden" />
            <Button size="sm" variant="outline" tone="neutral"><Icon name="funnel" />{frame.filter}</Button>
            <Button size="sm"><Icon name="plus" />{frame.add}</Button>
          </div>
          <Table
            {...library}
            items={rows}
            getKey={(row) => row.slug}
            caption={frame.title}
            columns={[
              { key: 'component', header: frame.columns.component, rowHeader: true, cell: (row) => <code dir="ltr" className="font-mono text-sm">{row.name}</code> },
              { key: 'kind', header: frame.columns.kind, cell: (row) => <Badge tone={KIND_TONE[row.rendering]} size="sm">{frame.kinds[row.rendering]}</Badge> },
              { key: 'js', header: frame.columns.js, className: 'max-md:hidden', cell: (row) => (row.clientBytes === null ? ZERO_KB : kbOf(row.clientBytes)) },
              { key: 'status', header: frame.columns.status, className: 'max-md:hidden', cell: () => frame.beta },
              { key: 'updated', header: frame.columns.updated, className: 'max-md:hidden', cell: (row) => monthOf(componentDate(row.slug), locale) },
            ]}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted">
            <p>{frame.showing(1, rows.length, CARDS.length)}</p>
            <Pagination {...library} value={1} pageCount={Math.ceil(CARDS.length / rows.length)} getHref={(page) => `#page-${String(page)}`} size="sm" />
          </div>
        </div>
      </div>
      <figcaption className="text-center text-sm text-muted">{frame.caption}</figcaption>
    </figure>
  )
}
