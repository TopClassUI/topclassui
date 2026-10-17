// R-5.12-4: the class strings of the Select, built from the shared field and overlay constants (unit-4.md, Select).
import {
  DISABLED, FIELD_BOX, FIELD_HOLDER, LABEL, LIST_CAP, OVERLAY_SURFACE, POPUP_MOTION, ROW, ROW_HIGHLIGHT, ROW_SELECTED,
  ROW_TOUCH, SCROLL_AREA,
} from '#shared/classes.js'

/** The box that owns the width. The trigger fills it, whatever its label is. */
export const SELECT_ROOT = `inline-grid align-middle ${FIELD_HOLDER}`
export const SELECT_TRIGGER = `inline-flex w-full items-center justify-between gap-2 text-start ${FIELD_BOX} data-readonly:bg-neutral-soft`
export const SELECT_VALUE = `${LABEL} flex-1 data-placeholder:text-muted`
export const SELECT_ICON = 'flex shrink-0 text-muted'
export const SELECT_POSITIONER = 'z-(--tc-z-popup) data-anchor-hidden:invisible'
/** At least as wide as its trigger, and never wider or taller than the room Base UI measured: capped on the list
 * alone, its line put the popup 2 px past the collision padding, 6 px from the screen's edge instead of 8. */
export const SELECT_POPUP = `flex min-w-(--anchor-width) max-w-(--available-width) max-h-(--available-height) flex-col ${OVERLAY_SURFACE} ${POPUP_MOTION}`
export const SELECT_LIST = `flex flex-col gap-0.5 p-1.5 outline-none ${LIST_CAP} ${SCROLL_AREA}`
export const SELECT_ITEM = `cursor-default select-none ${ROW} ${ROW_HIGHLIGHT} ${ROW_TOUCH} ${ROW_SELECTED} ${DISABLED}`
export const SELECT_ITEM_TEXT = `${LABEL} flex-1`
export const SELECT_ITEM_TICK = 'ms-auto flex shrink-0'
