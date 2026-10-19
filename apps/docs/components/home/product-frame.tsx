import { Badge } from 'topclassui/badge'
import { BORDER_STRONG } from 'topclassui/classes'
import { Button } from 'topclassui/button'
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
import { BrandTile } from '../shell/brand-mark'

const ROWS = ['button', 'select', 'date-picker', 'input', 'tag', 'table', 'dialog'] as const
/** As drawn: server green, client blue, split the info tone. */
export const KIND_TONE = { server: 'success', split: 'info', client: 'primary' } as const satisfies Record<Rendering, string>
const SIDEBAR_ICONS = ['house', 'file-text', 'users', 'clock', 'gear'] as const

/** "Sep 2026" in the page's language, with Latin digits as the rest of the prose (docs-site S10). */
function monthOf(date: string | null, locale: Locale): string {
  if (date === null) return '-'
  return new Intl.DateTimeFormat(`${locale}-u-nu-latn`, { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(date))
}

/** A header the frame draws as sortable, with the up-and-down caret the library's Table draws only on the sorted one. */
function Sortable({ label }: { label: string }) {
  // TODO(tc): Table could draw the unsorted caret itself on every column with a sortHref.
  return <span className="inline-flex items-center gap-1">{label}<span className="text-muted"><Icon name="caret-up-down" size="0.75rem" /></span></span>
}

/** The toast drawn in the frame's corner: still and inert, the shape of the library's Toast. */
function FrameToast({ title, body }: { title: string; body: string }) {
  // TODO(tc): a static Toast part, so a page can draw one without the toast manager.
  return (
    <div className={`absolute inset-e-6 bottom-6 flex items-center gap-2.5 rounded-box bg-surface-raised py-3 ps-3.5 pe-3 shadow-lg max-md:hidden ${BORDER_STRONG}`}>
      <span className="text-success-on-soft"><Icon name="check-circle" size="1.125rem" /></span>
      <div className="flex flex-col gap-px text-start">
        <p className="text-sm font-medium text-body">{title}</p>
        <code dir="ltr" className="font-mono text-xs text-muted">{body}</code>
      </div>
      <span className="text-muted"><Icon name="x" size="0.875rem" /></span>
    </div>
  )
}

/** A dashboard drawn from the library, server HTML and nothing that hydrates: Home's LCP candidate (docs-site page 1). */
export function ProductFrame({ locale, labels }: { locale: Locale; labels: SiteLabels }) {
  const frame = labels.home.frame
  const library = getLabels(locale)
  const rows = ROWS.map((slug) => cardBySlug(slug)).filter((entry): entry is CardEntry => entry !== undefined)
  return (
    <figure className="relative isolate flex flex-col gap-4.5">
      <div aria-hidden="true" className="docs-glow" />
      <div inert className="docs-frame relative flex overflow-hidden rounded-box bg-surface text-start md:aspect-5/3">
        <ul className="hidden w-53 shrink-0 flex-col gap-0.5 border-e border-line bg-page p-3 text-sm md:flex">
          <li className="flex items-center gap-2 ps-2 pt-1.5 pb-3.5 font-semibold text-body"><BrandTile className="size-5.5" />{labels.meta.siteName}</li>
          {frame.sidebar.map((item, index) => (
            <li key={item} className={`flex items-center gap-2.5 rounded-control px-2.5 py-2 ${index === 1 ? 'bg-primary-soft font-medium text-primary-on-soft' : 'text-body'}`}>
              <Icon name={SIDEBAR_ICONS[index] ?? 'file-text'} />
              {item}
            </li>
          ))}
        </ul>
        <div className="flex min-w-0 flex-1 flex-col gap-4.5 p-4 md:p-7">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex min-w-0 flex-1 basis-full flex-col gap-0.5 sm:basis-auto">
              <p className="text-xl font-semibold text-body">{frame.title}</p>
              <p className="text-xs text-muted">{frame.count(CARDS.length)}</p>
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
            visibleRows={rows.length + 1}
            sort={{ key: 'component', direction: 'ascending' }}
            columns={[
              { key: 'component', header: frame.columns.component, rowHeader: true, cell: (row) => <code dir="ltr" className="font-mono text-xs">{row.slug}</code> },
              { key: 'name', header: <Sortable label={frame.columns.name} />, className: 'font-medium', cell: (row) => row.name },
              { key: 'js', header: <Sortable label={frame.columns.js} />, className: 'max-md:hidden', cell: (row) => <bdi>{row.clientBytes === null ? ZERO_KB : kbOf(row.clientBytes)}</bdi> },
              { key: 'status', header: <Sortable label={frame.columns.status} />, cell: (row) => <Badge tone={KIND_TONE[row.rendering]} size="xs">{frame.kinds[row.rendering]}</Badge> },
              { key: 'updated', header: <Sortable label={frame.columns.updated} />, className: 'text-muted max-md:hidden', cell: (row) => monthOf(componentDate(row.slug), locale) },
              { key: 'actions', header: <span className="sr-only">{frame.columns.actions}</span>, align: 'end', className: 'text-muted', cell: () => <Icon name="dots-three" /> },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
            <p>{frame.showing(1, rows.length, CARDS.length)}</p>
            <Button size="xs" variant="outline" tone="neutral">{frame.perPage(rows.length)}<Icon name="caret-down" /></Button>
            <Pagination {...library} className="ms-auto" value={1} pageCount={Math.ceil(CARDS.length / rows.length)} siblingCount={1} boundaryCount={1} getHref={(page) => `#page-${String(page)}`} size="sm" />
          </div>
        </div>
        <FrameToast title={frame.toast.title} body={frame.toast.body} />
      </div>
      <figcaption className="text-center text-xs text-muted">{frame.caption}</figcaption>
    </figure>
  )
}
