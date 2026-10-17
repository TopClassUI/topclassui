// No 'use client': a client bundle gets it only when a client file imports it.
import { caretDoubleLeft } from '#icons/data/caret-double-left.js'
import { caretDoubleRight } from '#icons/data/caret-double-right.js'
import { caretLeft } from '#icons/data/caret-left.js'
import { caretRight } from '#icons/data/caret-right.js'
import type { IconData } from '#icons/types.js'
import { cn } from '#shared/cn.js'
import { en } from '#shared/labels/en.js'
import { createNumberFormat } from '#shared/labels/get-labels.js'
import { renderLink } from '#shared/link.js'
import { Svg } from '#components/svg/index.js'
import { CELL_GAP, CELL_SIZE, LIST } from './classes.js'
import { PAGINATION_DEFAULTS } from './constants.js'
import { clampPage, clampPageCount, listPages } from './lib.js'
import type { PaginationLinkParts, PaginationProps } from './types.js'
import { paginationVariants } from './variants.js'

/** Links to the pages around the current one. Every cell is a real anchor, so it works
 * with no JavaScript and a crawler follows it; lib.ts decides which pages are shown. */
export function Pagination({
  value,
  pageCount,
  getHref,
  link,
  siblingCount = PAGINATION_DEFAULTS.siblingCount,
  boundaryCount = PAGINATION_DEFAULTS.boundaryCount,
  size = PAGINATION_DEFAULTS.size,
  labels = en,
  locale = PAGINATION_DEFAULTS.locale,
  'aria-label': ariaLabel,
  ...rest
}: PaginationProps) {
  const count = clampPageCount(pageCount)
  const page = clampPage(value, count)
  const numbers = createNumberFormat(locale)
  const text = labels.pagination
  const cell = paginationVariants({ size })

  // An empty aria-label names nothing; a caller with two navs on a page names each.
  const name = ariaLabel === undefined || ariaLabel === '' ? text.label : ariaLabel

  /** An `<a>`, or the caller's element so a framework link navigates on the client. */
  const anchor = (target: number, parts: PaginationLinkParts) =>
    renderLink('Pagination', link, getHref(target), { ...parts })

  /** At an edge there is no page to go to, so it is a span and not a link to nowhere.
   * role="link" is what lets aria-disabled reach a screen reader, as Button's dead link does. */
  const control = (target: number, label: string, icon: IconData, atEdge: boolean, rel?: 'prev' | 'next') => (
    <li>
      {atEdge
        ? (
          <span role="link" aria-disabled="true" aria-label={label} data-disabled="" className={cell}>
            <Svg icon={icon} />
          </span>
        )
        : anchor(target, { 'aria-label': label, rel, className: cell, children: <Svg icon={icon} /> })}
    </li>
  )

  // The rest goes first, so data-size and the name are the ones Pagination worked out.
  return (
    <nav {...rest} aria-label={name} data-size={size}>
      <ul
        // Preflight removes the list style, and Safari with VoiceOver then drops the list semantics.
        role="list"
        className={LIST}
      >
        {control(1, text.first, caretDoubleLeft, page === 1)}
        {control(page - 1, text.previous, caretLeft, page === 1, 'prev')}
        {listPages({ value: page, pageCount: count, siblingCount, boundaryCount }).map((item) => {
          if (typeof item !== 'number') {
            return <li key={item} aria-hidden="true" className={cn(CELL_GAP, CELL_SIZE[size])}>...</li>
          }
          const current = item === page
          return (
            <li key={item}>
              {anchor(item, {
                // The count is said once, on the page the reader is on: "Page 3 of 12".
                'aria-label': current ? text.pageOf(item, count, numbers) : text.page(item, numbers),
                'aria-current': current ? 'page' : undefined,
                className: paginationVariants({ size, current }),
                children: numbers.format(item),
              })}
            </li>
          )
        })}
        {control(page + 1, text.next, caretRight, page === count, 'next')}
        {control(count, text.last, caretDoubleRight, page === count)}
      </ul>
    </nav>
  )
}

// The page Pagination shows, for the query that fetches it: `?page=999` of 12 is page 12 in both.
export { clampPage } from './lib.js'
export { paginationVariants } from './variants.js'
export type { PaginationDesignProps, PaginationProps } from './types.js'
