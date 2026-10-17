/** R-8.3-6: the bounds only. Twelve cells is the longest code a row can still wrap to (choice 39); a group of
 * 0 draws no separator, and a group is never longer than the code (R-5.7-7). */
export const OTP_FIELD_BOUNDARIES = {
  lengthMin: 1,
  lengthMax: 12,
  groupSizeMin: 0,
} as const
