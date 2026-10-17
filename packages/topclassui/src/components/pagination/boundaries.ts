/** R-8.3-6: the bounds only. Sibling and boundary counts stop at 3, so the row is 15
 * cells at most; the count stops where page + 1 is no longer an exact number. */
export const PAGINATION_BOUNDARIES = {
  pageMin: 1,
  pageCountMax: Number.MAX_SAFE_INTEGER,
  siblingCountMin: 0,
  siblingCountMax: 3,
  boundaryCountMin: 0,
  boundaryCountMax: 3,
} as const
