/** R-8.3-6: the bounds only. R-5.2-7 cuts a label to its box; this bounds the string itself.
 * A row names one page, so 100 characters is a guard rail, not a validator. */
export const SIDEBAR_BOUNDARIES = {
  labelMaxLength: 100,
} as const
