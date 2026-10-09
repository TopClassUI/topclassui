/** R-8.3-6: the bounds only. Fifty lines is a page, not a placeholder, so the cap is a
 * guard rail: it stops rows={1e6} writing a million spans, and no real paragraph meets it. */
export const SKELETON_BOUNDARIES = {
  rowsMin: 1,
  rowsMax: 50,
} as const
