/** R-8.3-6: the bounds only. One star is the least a scale can have, and ten is past any
 * rating a page shows: a longer row is a slider, not a rating. */
export const RATING_BOUNDARIES = {
  maxMin: 1,
  maxMax: 10,
} as const
