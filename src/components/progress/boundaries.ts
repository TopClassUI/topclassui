/** R-8.3-6: the bounds only. The value is a percentage, so the range is all of it; a
 * custom range is Meter's job, which is why Progress takes no min or max prop. */
export const PROGRESS_BOUNDARIES = {
  valueMin: 0,
  valueMax: 100,
} as const
