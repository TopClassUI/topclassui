// R-8.3-2: the value lists and the defaults. The bounds live in boundaries.ts.
import { PLACEMENTS } from '#shared/floating.js'

/** The twelve shared placements; start and end are the inline sides, so they mirror. */
export const TOOLTIP_PLACEMENTS = PLACEMENTS

/** top, not the shared bottom-start, which is for menus. The delays are Base UI's own
 * 600 and 0, recorded for the schema: a delay left out is never forwarded. */
export const TOOLTIP_DEFAULTS = {
  placement: 'top',
  delay: 600,
  closeDelay: 0,
} as const

/** The drawn arrow, added to the shared gap: Figma nets 11 px from the popup to the trigger. */
export const TOOLTIP_ARROW_HEIGHT = 5

/** A side only ever flips to its opposite, so the arrow always has an edge class to match. */
export const TOOLTIP_COLLISION_AVOIDANCE = { fallbackAxisSide: 'none' } as const
