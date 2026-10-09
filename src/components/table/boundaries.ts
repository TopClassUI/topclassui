/** R-8.3-6: the bounds only. A hundred rows is the largest page a placeholder stands in
 * for and fifty columns is past any table that fits a screen: guard rails, not validators. */
export const TABLE_BOUNDARIES = {
  skeletonRowsMin: 1,
  skeletonRowsMax: 100,
  skeletonColumnsMin: 1,
  skeletonColumnsMax: 50,
} as const
