// No 'use client': a client bundle gets it only when a client file imports it.
import { caretRight } from '#icons/data/caret-right.js'
import { LABEL } from '#shared/classes.js'
import { cn } from '#shared/cn.js'
import { en } from '#shared/labels/en.js'
import { renderLink } from '#shared/link.js'
import { Svg } from '#components/svg/index.js'
import { BREADCRUMB_BOUNDARIES } from './boundaries.js'
import { CURRENT, ITEM, LINK, LIST, ROOT, TEXT } from './classes.js'
import { buildBreadcrumbList, serializeJsonLd } from './lib.js'
import type { BreadcrumbProps } from './types.js'

/** Where the page sits in the site: real links, the page being read last, and the same
 * trail as BreadcrumbList JSON-LD for a crawler. An empty trail renders nothing. */
export function Breadcrumb({ items, link, baseUrl, labels = en, className, ...rest }: BreadcrumbProps) {
  // A blank label is a link with no name, so the crumb is left out of the list and the JSON-LD.
  const trail = items.filter((item) => item.label.trim() !== '')
  // A navigation landmark with nothing in it is announced and then leads nowhere.
  if (trail.length === 0) return null

  const lastIndex = trail.length - 1
  const jsonLd = buildBreadcrumbList(trail, baseUrl)

  return (
    <nav aria-label={labels.breadcrumb.label} className={cn(ROOT, className)} {...rest}>
      {/* Preflight removes the list style, and Safari with VoiceOver then drops the list role. */}
      <ol role="list" className={LIST}>
        {trail.map((item, index) => {
          // R-5.2-7: the box cuts the rendering; the JSON-LD below keeps the whole label.
          const text = item.label.slice(0, BREADCRUMB_BOUNDARIES.labelMaxLength)
          const current = index === lastIndex

          return (
            // The index is the key: two crumbs may share a label, and the trail is never reordered.
            <li key={index} className={ITEM}>
              {/* Svg hides an unlabelled icon and flips a directional one under dir="rtl". */}
              {index === 0 ? null : <Svg icon={caretRight} />}
              {item.href === undefined ? (
                <span aria-current={current ? 'page' : undefined} className={current ? CURRENT : TEXT}>{text}</span>
              ) : renderLink('Breadcrumb', link, item.href, {
                className: LINK, children: <span className={LABEL}>{text}</span>,
              })}
            </li>
          )
        })}
      </ol>
      {/* An empty itemListElement is invalid structured data, so no link means no script. */}
      {jsonLd.itemListElement.length === 0 ? null : (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }} />
      )}
    </nav>
  )
}

export type { BreadcrumbItem, BreadcrumbProps } from './types.js'
