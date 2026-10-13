/** R-8.3-6: the bounds only. R-5.2-7 cuts a label to its box; this bounds the string itself.
 * The longest label a demo shows is 82 characters, so 100 is a guard rail, not a validator. */
export const TABS_BOUNDARIES = {
  labelMaxLength: 100,
} as const
