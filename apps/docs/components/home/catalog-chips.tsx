import Link from 'next/link'
import { BORDER, FOCUS_RING, HOVER, TOUCH_TARGET, TRANSITION } from 'topclassui/classes'
import { Icon } from 'topclassui/icon'

import { hrefOf, pageBySlug, type Locale } from '../../content/pages'
import type { Rendering, SiteLabels } from '../../labels'
import { CARDS } from '../../lib/data'
import { TEXT_LINK, TINT } from '../classes'
import { KIND_TONE } from './product-frame'

const CHIP = `inline-flex items-center gap-2 rounded-control bg-surface py-2 ps-2.5 pe-3 text-sm font-medium text-body ${BORDER}`
const CHIP_LINK = `docs-hover-lift ${CHIP} ${HOVER.outline} ${FOCUS_RING} ${TOUCH_TARGET} ${TRANSITION}`
const KIND_BADGE = 'inline-flex h-4.5 min-w-5.5 items-center justify-center rounded-chip px-1 font-mono text-xs'

function badgeOf(rendering: Rendering): string {
  return `${KIND_BADGE} ${TINT[KIND_TONE[rendering]]}`
}

/** The 46 cards as chips with S, C or Sp from meta.ts; each links to its page. */
export function CatalogChips({ locale, labels }: { locale: Locale; labels: SiteLabels }) {
  const text = labels.home.catalog
  const catalog = pageBySlug('components')
  return (
    <div className="flex flex-col gap-7">
      <ul dir="ltr" data-motion="stagger" className="flex flex-wrap gap-2">
        {CARDS.map((card) => {
          const inner = (
            <>
              <span aria-hidden="true" className={badgeOf(card.rendering)}>{text.badges[card.rendering]}</span>
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
        <Link href={hrefOf(catalog, locale)} className={`${TEXT_LINK} gap-1.5 self-center text-sm font-medium`}>
          {text.open}
          <Icon name="arrow-right" />
        </Link>
      )}
    </div>
  )
}
