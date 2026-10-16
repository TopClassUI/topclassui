// R-8.3-2: the value list and the defaults. The bounds live in boundaries.ts.
import { PLACEMENTS } from '#shared/floating.js'

/** The twelve shared placements; start and end are the inline sides, so they mirror. */
export const POPOVER_PLACEMENTS = PLACEMENTS

/** bottom, centred under its trigger. The delays are Base UI's own 300 and 0 for a
 * trigger with openOnHover, recorded for the schema: a delay left out is never forwarded. */
export const POPOVER_DEFAULTS = {
  placement: 'bottom',
  delay: 300,
  closeDelay: 0,
} as const
