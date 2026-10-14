// R-8.3-2: the value lists and the defaults. The bounds live in boundaries.ts.
import { MENU_ITEM_TONES } from '#shared/contracts/menu.js'
import { DEFAULT_PLACEMENT, PLACEMENTS } from '#shared/floating.js'

/** The twelve shared placements; start and end are the inline sides, so they mirror. */
export const DROPDOWN_PLACEMENTS = PLACEMENTS

/** The two looks of a row, from the menu contract a Drawer menu will share. */
export const DROPDOWN_ITEM_TONES = MENU_ITEM_TONES

/** bottom-start, the shared default of a menu. The delays are Base UI's own 100 and 0 for a
 * trigger with openOnHover, recorded for the schema: a delay left out is never forwarded. */
export const DROPDOWN_DEFAULTS = {
  placement: DEFAULT_PLACEMENT,
  tone: 'neutral',
  delay: 100,
  closeDelay: 0,
} as const
