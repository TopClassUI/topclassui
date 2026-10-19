import Link from 'next/link'
import { BORDER, FOCUS_RING, HOVER, TRANSITION } from 'topclassui/classes'
import { Icon } from 'topclassui/icon'

const CARD = `flex items-center gap-2.5 rounded-box bg-surface px-4.5 py-4 tone-neutral ${BORDER} ${HOVER.outline} ${FOCUS_RING} ${TRANSITION}`

/** "Next" and the following live page; the arrow is directional, so it flips in RTL. */
export function NextCard({ href, title, label }: { href: string; title: string; label: string }) {
  return (
    <Link href={href} className={CARD}>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-xs font-medium text-muted uppercase">{label}</span>
        <span className="truncate text-base font-semibold text-body">{title}</span>
      </span>
      <span className="inline-flex text-primary-on-soft"><Icon name="arrow-right" /></span>
    </Link>
  )
}
