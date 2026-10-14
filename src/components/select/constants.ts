// R-8.3-2: the value lists and the defaults. The one bound is the shared COLLECTION_BOUNDARIES (no boundaries.ts, R-8.3-6).
import { COLLECTION_DEFAULTS } from '#shared/contracts/collection.js'
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'
import { PLACEMENTS } from '#shared/floating.js'

export const SELECT_SIZES = SIZES

/** The twelve shared placements; start and end are the inline sides, so they mirror. */
export const SELECT_PLACEMENTS = PLACEMENTS

/** Every prop's starting value. visibleRows is the --tc-list-rows knob's, which applies until the prop is passed. */
export const SELECT_DEFAULTS = {
  size: DEFAULT_SIZE,
  placement: 'bottom-start',
  invalid: false,
  fullWidth: false,
  visibleRows: COLLECTION_DEFAULTS.visibleRows,
} as const
