/** R-8.3-6: the bounds only. The dates are the first and the last day a four-digit ISO year can write, and the
 * week starts on one of the seven days Intl numbers 1 (Monday) to 7 (Sunday). Each is clamped (R-5.7-7). */
export const DATE_PICKER_BOUNDARIES = {
  minDate: '0001-01-01',
  maxDate: '9999-12-31',
  firstDayOfWeekMin: 1,
  firstDayOfWeekMax: 7,
} as const
