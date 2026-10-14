/** R-8.3-6: the bounds only. One line is the least a textarea can show, and forty fill a tall screen
 * twice over. rows and maxRows are clamped to them (R-5.7-7); the cap is the shared TEXT_MAX_LENGTH. */
export const TEXTAREA_BOUNDARIES = {
  rowsMin: 1,
  rowsMax: 40,
  maxRowsMin: 1,
  maxRowsMax: 40,
} as const
