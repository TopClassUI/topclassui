/** R-8.3-6: the bounds only. R-5.2-7 cuts a label to its box; this bounds the string itself. The longest
 * label a demo shows is 43 characters and the most segments seven, so 100 and 50 are guard rails, not validators. */
export const SEGMENTED_CONTROL_BOUNDARIES = {
  labelMaxLength: 100,
  skeletonItemsMin: 1,
  skeletonItemsMax: 50,
} as const
