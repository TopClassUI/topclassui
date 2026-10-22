// No 'use client': a client bundle gets it only when a client file imports it.
import { caretRight } from '#icons/data/caret-right.js'
import { dotsThree } from '#icons/data/dots-three.js'
import { house } from '#icons/data/house.js'
import { cn } from '#shared/cn.js'
import { en } from '#shared/labels/en.js'
import { renderLink } from '#shared/link.js'
import { cutLabel, resolveLabelDir, truncateLabel } from '#shared/truncate-label.js'
import { Svg } from '#components/svg/index.js'
import { BREADCRUMB_BOUNDARIES } from './boundaries.js'
import { BREADCRUMB_DEFAULTS } from './constants.js'
import { CURRENT, GAP, HIDDEN_LABEL, ITEM, LINK, LIST, ROOT, TEXT } from './classes.js'
import { buildBreadcrumbList, collapseTrail, serializeJsonLd } from './lib.js'
import type { BreadcrumbProps } from './types.js'

/** Where the page sits in the site: real links, the page being read last and, given `siteUrl`,
 * the same trail as BreadcrumbList JSON-LD for a crawler. An empty trail renders nothing. */
export function Breadcrumb({
  items,
  link,
  siteUrl,
  showHome = BREADCRUMB_DEFAULTS.showHome,
  maxItems = BREADCRUMB_DEFAULTS.maxItems,
  labels = en,
  locale: _locale,
  className,
  'aria-label': ariaLabel,
  ...rest
}: BreadcrumbProps) {
  // A blank label is a link with no name, and a CMS may send none: either way the crumb is left out, of the JSON-LD too.
  const trail = items.filter((item) => typeof item.label === 'string' && item.label.trim() !== '')
  // A navigation landmark with nothing in it is announced and then leads nowhere.
  if (trail.length === 0) return null

  const lastIndex = trail.length - 1
  const jsonLd = buildBreadcrumbList(trail, siteUrl)
  // An empty aria-label names nothing, so the label stands in for it, as in Pagination.
  const name = ariaLabel === undefined || ariaLabel === '' ? labels.breadcrumb.label : ariaLabel

  return (
    <nav aria-label={name} className={cn(ROOT, className)} {...rest}>
      {/* Preflight removes the list style, and Safari with VoiceOver then drops the list role. */}
      <ol role="list" className={LIST}>
        {collapseTrail(trail.length, maxItems).map((index) => {
          // The folded crumbs are one mark, hidden from a screen reader as Pagination's gap is.
          if (index === 'gap') return <li key="gap" aria-hidden="true" className={ITEM}><Svg icon={caretRight} /><span className={GAP}><Svg icon={dotsThree} /></span></li>
          const item = trail[index] as (typeof trail)[number]
          // R-5.2-7: the box cuts the rendering; the JSON-LD below keeps the whole label.
          const max = BREADCRUMB_BOUNDARIES.labelMaxLength
          const current = index === lastIndex
          const home = showHome && index === 0
          const text = home ? <span className={HIDDEN_LABEL}>{cutLabel(item.label, max)}</span> : null

          return (
            // The index is the key: two crumbs may share a label, and the trail is never reordered.
            <li key={index} className={ITEM}>
              {/* Svg hides an unlabelled icon and flips a directional one under dir="rtl"; the house stands as the root, with no caret after it (Figma 138:1173). */}
              {index === 0 || (showHome && index === 1) ? null : <Svg icon={caretRight} />}
              {item.href === undefined ? (
                <span dir={resolveLabelDir(item.label)} aria-current={current ? 'page' : undefined} className={current ? CURRENT : TEXT}>
                  {home ? <><Svg icon={house} />{text}</> : cutLabel(item.label, max)}
                </span>
              ) : renderLink('Breadcrumb', link, item.href, { className: LINK, children: home ? <><Svg icon={house} />{text}</> : truncateLabel(item.label, max) })}
            </li>
          )
        })}
      </ol>
      {/* Without siteUrl a demo or a preview would claim a trail for the page that holds it. */}
      {jsonLd === null ? null : (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      )}
    </nav>
  )
}

export type { BreadcrumbDesignProps, BreadcrumbItem, BreadcrumbProps } from './types.js'
