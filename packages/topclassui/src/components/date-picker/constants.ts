// R-8.3-2: the value lists and the defaults. The bounds live in boundaries.ts.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'
import { PLACEMENTS } from '#shared/floating.js'
import { DATE_PICKER_BOUNDARIES } from './boundaries.js'

export const DATE_PICKER_SIZES = SIZES

/** The twelve shared placements; start and end are the inline sides, so they mirror. */
export const DATE_PICKER_PLACEMENTS = PLACEMENTS

/** An ISO calendar date with four digits of year; whether the day exists is parseIsoDate's to say. */
export const DATE_PICKER_ISO_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/

/** Every prop's starting value. firstDayOfWeek has none: the locale's, read in the browser, else weekStartFallback. */
export const DATE_PICKER_DEFAULTS = {
  size: DEFAULT_SIZE,
  placement: 'bottom-start',
  invalid: false,
  fullWidth: false,
  // While open, Tab goes round the calendar and stays in it, as the date picker dialog of the Authoring Practices asks.
  modal: 'trap-focus',
  minDate: DATE_PICKER_BOUNDARIES.minDate,
  maxDate: DATE_PICKER_BOUNDARIES.maxDate,
  weekStartFallback: 1,
} as const
