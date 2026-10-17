/** R-8.3-6: the bounds only. R-5.2-7 cuts the label to the box; this bounds the string
 * itself. A badge reads in a glance, so 100 characters is a guard rail, not a limit. */
export const BADGE_BOUNDARIES = {
  labelMaxLength: 100,
} as const
