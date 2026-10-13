/** R-8.3-6: the bounds only. Five hundred rows is the largest page a table is given (PLAN 18.2)
 * and fifty columns is past any table that fits a screen: guard rails, not validators. */
export const TABLE_BOUNDARIES = {
  skeletonRowsMin: 1,
  skeletonRowsMax: 500,
  skeletonColumnsMin: 1,
  skeletonColumnsMax: 50,
} as const
