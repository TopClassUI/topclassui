// R-5.12-4: one class string per element Popover styles, built from the shared overlay constants.
import { FOCUS_RING_INSET, HOVER, ICON_BUTTON, OVERLAY_SURFACE, POPUP_MOTION, SCROLL_AREA } from '#shared/classes.js'

/** Above the page, and hidden once its trigger scrolls out of view (PLAN 10.5). */
export const POPOVER_POSITIONER = 'z-(--tc-z-popup) data-anchor-hidden:invisible'

/** R-10.5-1: a column 280 px wide that is its own scroll container. It never outgrows the room
 * Base UI measured beside its trigger: it shrinks to it and scrolls inside. A word too long for
 * its width breaks, and its ring is drawn inside its box, which sits 6 px from the trigger. */
export const POPOVER_POPUP = [
  'flex w-70 max-w-(--available-width) max-h-(--available-height) flex-col gap-3 p-4 text-sm wrap-anywhere',
  // A flex item gives up its height before its container scrolls: a 32 px action was squeezed to 24.
  '*:shrink-0',
  SCROLL_AREA,
  OVERLAY_SURFACE,
  POPUP_MOTION,
  FOCUS_RING_INSET,
].join(' ')

export const POPOVER_TITLE = 'text-sm font-semibold text-body'

export const POPOVER_DESCRIPTION = 'text-sm text-muted'

/** The x: an icon button on the neutral ramp, so its hover is the ghost tint. */
export const POPOVER_CLOSE = `${ICON_BUTTON} text-muted tone-neutral ${HOVER.ghost}`
