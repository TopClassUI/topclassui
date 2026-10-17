// R-8.3-2: the value lists and the defaults. The bounds are the shared COLLECTION_BOUNDARIES and TEXT_MAX_LENGTH.
import { DEFAULT_SIZE, SIZES } from '#shared/contracts/size.js'
import { DEFAULT_PLACEMENT, PLACEMENTS } from '#shared/floating.js'

export const COMBOBOX_SIZES = SIZES

/** The twelve shared placements; start and end are the inline sides, so they mirror. */
export const COMBOBOX_PLACEMENTS = PLACEMENTS

/** What the list is doing besides showing its options: the first page, or the next one, is on its way. */
export const COMBOBOX_STATUSES = ['idle', 'loading', 'loading-more'] as const

/** Every prop's starting value. A caller overrides any of them by passing the prop. */
export const COMBOBOX_DEFAULTS = {
  size: DEFAULT_SIZE,
  invalid: false,
  fullWidth: false,
  placement: DEFAULT_PLACEMENT,
  // The --tc-list-rows knob, which applies whenever the prop is left out.
  visibleRows: 7,
  virtualize: 'auto',
  hasMore: false,
  loadMoreThreshold: 10,
  status: 'idle',
} as const

/** A row before it is measured: ROW is 40 px at a density of 1. The list then measures the first row it mounts. */
export const COMBOBOX_ROW_ESTIMATE = 40
