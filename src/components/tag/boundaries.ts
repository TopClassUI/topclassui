/** R-8.3-6: the bounds only. R-5.2-7 cuts the label to the box; this bounds the string
 * itself. A tag names one topic, so 100 characters is a guard rail, not a limit. */
export const TAG_BOUNDARIES = {
  labelMaxLength: 100,
} as const
