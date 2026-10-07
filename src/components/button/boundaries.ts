/** R-8.3-6: the bounds only. R-5.2-7 cuts the label to the box; this bounds the string
 * itself. The longest label in the demos is 16 characters, so 100 is already generous. */
export const BUTTON_BOUNDARIES = {
  labelMaxLength: 100,
} as const
