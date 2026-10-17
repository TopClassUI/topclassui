/** R-8.3-6: the bounds only. A hundred rows is taller than any screen, so this stops a stray
 * 10000 rather than judging a real value (R-5.7-7); the list is capped by the screen as well. */
export const COMMAND_BOUNDARIES = {
  visibleRowsMin: 1,
  visibleRowsMax: 100,
} as const
