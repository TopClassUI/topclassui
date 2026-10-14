/** R-8.3-6: the bounds only. R-5.2-7 cuts a label to its row; labelMaxLength bounds the string
 * itself, far past any menu label. Ten seconds is past any delay a reader would sit through. */
export const DROPDOWN_BOUNDARIES = {
  labelMaxLength: 100,
  delayMin: 0,
  delayMax: 10000,
} as const
