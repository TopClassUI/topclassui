// Pure: the page list is worked out here, so it is tested without rendering anything.
import { clamp } from '#shared/clamp.js'
import { PAGINATION_BOUNDARIES } from './boundaries.js'
import type { PaginationItem, PaginationRange } from './types.js'

/** Number() first: clamp only catches a real NaN, so a string from a JavaScript
 * caller would reach Math.max and print NaN in a link. After it, 'abc' is the minimum. */
const bound = (given: unknown, min: number, max: number): number => clamp(Number(given), min, max)

/** A whole number of pages, at least one. Rounded up: 7.5 pages of rows need an eighth. */
export function clampPageCount(pageCount: number): number {
  return Math.ceil(bound(pageCount, PAGINATION_BOUNDARIES.pageMin, PAGINATION_BOUNDARIES.pageCountMax))
}

/** The current page, held inside 1 to the count whatever the URL said. */
export function clampPage(value: number, pageCount: number): number {
  return Math.floor(bound(value, PAGINATION_BOUNDARIES.pageMin, clampPageCount(pageCount)))
}

const range = (from: number, to: number): number[] =>
  Array.from({ length: Math.max(to - from + 1, 0) }, (_, index) => from + index)

/** The cells in reading order. The row is the same length on every page, and a gap
 * always stands for two pages or more: one hidden page is shown instead. */
export function listPages({ value, pageCount, siblingCount, boundaryCount }: PaginationRange): PaginationItem[] {
  const count = clampPageCount(pageCount)
  const page = clampPage(value, count)
  const siblings = Math.floor(
    bound(siblingCount, PAGINATION_BOUNDARIES.siblingCountMin, PAGINATION_BOUNDARIES.siblingCountMax),
  )
  const boundary = Math.floor(
    bound(boundaryCount, PAGINATION_BOUNDARIES.boundaryCountMin, PAGINATION_BOUNDARIES.boundaryCountMax),
  )

  // Both ends, the siblings, the current page and two gaps: at or under that, every page fits.
  const slots = boundary * 2 + siblings * 2 + 3
  if (count <= slots) return range(1, count)

  // The window slides and never shrinks, so no cell moves under the pointer near an end.
  const start = clamp(page - siblings, boundary + 2, count - boundary - siblings * 2 - 1)
  const end = start + siblings * 2
  const before = start > boundary + 2 ? 'gap-start' : boundary + 1
  const after = end < count - boundary - 1 ? 'gap-end' : count - boundary

  return [
    ...range(1, boundary),
    before,
    ...range(start, end),
    after,
    ...range(count - boundary + 1, count),
  ]
}
