// Pure: the page list is worked out here, so it is tested without rendering anything.
import { clamp } from '#shared/clamp.js'
import { PAGINATION_BOUNDARIES } from './boundaries.js'
import { PAGINATION_CELL_PX, PAGINATION_ROW_STEPS, PAGINATION_ROW_WIDEST } from './constants.js'
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

/** The full row's width in px: four arrows, then each page by its digits and each gap ('') at a page's floor. */
export function measureRow(cells: readonly string[], size: keyof typeof PAGINATION_CELL_PX): number {
  const px = PAGINATION_CELL_PX[size]
  const pages = cells.map((cell) => Math.max(px.page, cell.length * px.digit + px.padding))
  return px.arrow * 4 + pages.reduce((sum, width) => sum + width, 0) + px.gap * (cells.length + 3)
}

/** The narrowest step, in rem at 16 px, that holds the row; a row past the widest takes the widest. */
export function pickRowStep(px: number): (typeof PAGINATION_ROW_STEPS)[number] {
  return PAGINATION_ROW_STEPS.find((step) => step * 16 >= px) ?? PAGINATION_ROW_WIDEST
}
