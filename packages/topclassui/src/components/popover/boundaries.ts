/** R-8.3-6: the bounds only. Ten seconds is past any delay a reader would sit through,
 * so this stops a stray 60000 rather than judging a real value (R-5.7-7). */
export const POPOVER_BOUNDARIES = {
  delayMin: 0,
  delayMax: 10000,
} as const
