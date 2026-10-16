/** R-8.3-6: the bounds only. One line is the least a textarea can show, and forty fill a tall screen
 * twice over. A cap past 2^31 - 1 is dropped by Chromium, which reads maxlength as -1; the default cap is
 * the shared TEXT_MAX_LENGTH. Each is clamped to here (R-5.7-7). */
export const TEXTAREA_BOUNDARIES = {
  rowsMin: 1,
  rowsMax: 40,
  maxRowsMin: 1,
  maxRowsMax: 40,
  maxLengthMin: 0,
  maxLengthMax: 2_147_483_647,
} as const
