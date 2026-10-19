// R-5.12-4: the class strings of the Select, built from the shared field and overlay constants (unit-4.md, Select).
import {
  DISABLED, FIELD_BOX, FIELD_HOLDER, LABEL, LIST_CAP, OVERLAY_SURFACE, POINTER, POPUP_BOUNDS, POPUP_MOTION, ROW, ROW_FOCUSED,
  ROW_SELECTED, ROW_TOUCH, SCROLL_AREA,
} from '#shared/classes.js'

/** The box that owns the width. The trigger fills it, whatever its label is. */
export const SELECT_ROOT = `inline-grid align-middle ${FIELD_HOLDER}`
/** The ring of FOCUS_RING, held on the trigger of an open list. */
const SELECT_OPEN_RING = 'data-popup-open:outline-solid data-popup-open:outline-(length:--tc-ring-width) data-popup-open:outline-offset-(length:--tc-ring-offset) data-popup-open:outline-ring'

/** Read-only looks like idle, as the frames draw it; under forced colours its line is dashed. Open, it keeps the ring the frame draws while the focus is in the list. */
export const SELECT_TRIGGER = `inline-flex w-full items-center justify-between gap-2 text-start ${FIELD_BOX} ${POINTER} forced-colors:data-readonly:border-dashed ${SELECT_OPEN_RING}`
export const SELECT_VALUE = `${LABEL} flex-1 data-placeholder:text-muted`
export const SELECT_ICON = 'flex shrink-0 text-muted'
export const SELECT_POSITIONER = 'z-(--tc-z-popup) data-anchor-hidden:invisible'
/** As wide as its trigger when there is room, never wider or taller than the room Base UI measured, rounded down as
 * POPUP_BOUNDS rounds it. Capped on the list alone, it sat 6 px from the edge. */
export const SELECT_POPUP = `flex min-w-[min(var(--anchor-width),round(down,var(--available-width),1px))] ${POPUP_BOUNDS} flex-col ${OVERLAY_SURFACE} ${POPUP_MOTION}`
export const SELECT_LIST = `flex flex-col gap-0.5 p-1.5 outline-none ${LIST_CAP} ${SCROLL_AREA}`
export const SELECT_ITEM = `select-none ${ROW} ${ROW_FOCUSED} ${ROW_TOUCH} ${ROW_SELECTED} ${DISABLED}`
export const SELECT_ITEM_TEXT = `${LABEL} flex-1`
export const SELECT_ITEM_TICK = 'ms-auto flex shrink-0'
