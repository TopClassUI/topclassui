import Link from 'next/link'
import { BORDER, FOCUS_RING, HOVER, TRANSITION } from 'topclassui/classes'
import { Icon } from 'topclassui/icon'

const CARD = `flex items-center gap-3 rounded-box bg-surface px-4 py-4 tone-neutral ${BORDER} ${HOVER.outline} ${FOCUS_RING} ${TRANSITION}`

export interface PageLink {
  href: string
  title: string
}

/** "Previous" or "Next" and that page; the arrow is directional, so it flips in RTL. */
export function NextCard({ href, title, label, direction = 'next' }: PageLink & { label: string; direction?: 'previous' | 'next' }) {
  const previous = direction === 'previous'
  return (
    <Link href={href} rel={previous ? 'prev' : 'next'} className={CARD}>
      {previous ? <Icon name="arrow-left" /> : null}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs font-semibold text-muted">{label}</span>
        <span className="truncate text-base font-medium text-body">{title}</span>
      </span>
      {previous ? null : <Icon name="arrow-right" />}
    </Link>
  )
}

/** The previous and next pages under an article, in a nav of their own; either may be missing. */
export function Pager({ previous, next, labels }: { previous: PageLink | undefined; next: PageLink | undefined; labels: { pager: string; previous: string; next: string } }) {
  if (previous === undefined && next === undefined) return null
  return (
    <nav aria-label={labels.pager} className={`grid grid-cols-1 gap-4 ${previous === undefined || next === undefined ? '' : 'sm:grid-cols-2'}`}>
      {previous === undefined ? null : <NextCard {...previous} label={labels.previous} direction="previous" />}
      {next === undefined ? null : <NextCard {...next} label={labels.next} />}
    </nav>
  )
}
