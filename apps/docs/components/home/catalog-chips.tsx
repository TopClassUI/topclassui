import Link from 'next/link'
import { Badge } from 'topclassui/badge'
import { BORDER, FOCUS_RING, HOVER, TRANSITION } from 'topclassui/classes'
import { Icon } from 'topclassui/icon'

import { hrefOf, pageBySlug, type Locale } from '../../content/pages'
import type { SiteLabels } from '../../labels'
import { CARDS } from '../../lib/data'
import { TEXT_LINK } from '../classes'
import { KIND_TONE } from './product-frame'

const CHIP = `inline-flex min-h-9 items-center gap-2 rounded-control bg-surface px-3 text-sm text-body tone-neutral ${BORDER}`
const CHIP_LINK = `${CHIP} ${HOVER.outline} ${FOCUS_RING} ${TRANSITION}`

/** The 46 cards as chips with S, C or Sp from meta.ts; each links to its page once the component pages are live. */
export function CatalogChips({ locale, labels }: { locale: Locale; labels: SiteLabels }) {
  const text = labels.home.catalog
  const catalog = pageBySlug('components')
  return (
    <div className="flex flex-col gap-6">
      <ul dir="ltr" className="flex flex-wrap gap-2">
        {CARDS.map((card) => {
          const inner = (
            <>
              <Badge tone={KIND_TONE[card.rendering]} size="xs" aria-hidden="true">{text.badges[card.rendering]}</Badge>
              <span className="sr-only">{labels.home.frame.kinds[card.rendering]}</span>
              <span>{card.name}</span>
            </>
          )
          return (
            <li key={card.slug}>
              {catalog === undefined ? <span className={CHIP}>{inner}</span> : (
                <Link href={`${hrefOf(catalog, locale)}/${card.slug}`} className={CHIP_LINK}>{inner}</Link>
              )}
            </li>
          )
        })}
      </ul>
      {catalog === undefined ? null : (
        <Link href={hrefOf(catalog, locale)} className={`${TEXT_LINK} gap-2 self-start`}>
          {text.open}
          <Icon name="arrow-right" />
        </Link>
      )}
    </div>
  )
}
