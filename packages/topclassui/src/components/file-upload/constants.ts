// R-8.3-2: the value lists and the defaults. The bounds live in boundaries.ts and in the shared COLLECTION_BOUNDARIES.
import { COLLECTION_DEFAULTS } from '#shared/contracts/collection.js'

/** Why a file was refused: each names a label of the file group. */
export const FILE_UPLOAD_REASONS = ['tooLarge', 'wrongType'] as const

/** The units a size is written in above 1,023 bytes, each 1,024 times the one before. */
export const FILE_UPLOAD_UNITS = ['kilobyte', 'megabyte', 'gigabyte'] as const

/** Every prop's starting value. visibleRows is the --tc-list-rows knob's, which applies until the prop is passed. */
export const FILE_UPLOAD_DEFAULTS = {
  maxFiles: 1,
  maxSize: 10_737_418_240,
  invalid: false,
  visibleRows: COLLECTION_DEFAULTS.visibleRows,
} as const

/** How many refused names the hidden status line reads before it gives the count of the rest. */
export const FILE_UPLOAD_ANNOUNCED = 5
