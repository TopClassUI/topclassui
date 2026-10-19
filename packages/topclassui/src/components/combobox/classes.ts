// R-5.12-4: one class string per element Combobox styles, built from the shared field and overlay constants.
import {
  DISABLED, FIELD_BOX, FIELD_OWN_WIDTH, LABEL, LIST_CAP, OVERLAY_SURFACE, POPUP_BOUNDS, POPUP_MOTION, ROW, ROW_HIGHLIGHT, ROW_SELECTED,
  ROW_TOUCH, SCROLL_AREA,
} from '#shared/classes.js'

/** The box that owns the width. The input fills it and the caret sits over its end. */
export const COMBOBOX_ROOT = 'relative inline-block max-w-full align-middle'

/** The width of the box: an Input's, or its parent's with fullWidth. */
export const COMBOBOX_WIDTH = { own: FIELD_OWN_WIDTH, full: 'w-full' } as const

export const COMBOBOX_INPUT = `peer w-full ${FIELD_BOX}`

/** Merged after the size: they replace its inline padding, to keep the text clear of the glass and the spinner. */
export const COMBOBOX_INPUT_START = 'ps-9'
export const COMBOBOX_INPUT_END = 'pe-9'

/** The magnifying glass at the inline start, as the frame draws a search field. It dims with a disabled input. */
export const COMBOBOX_SEARCH = 'pointer-events-none absolute inset-y-0 inset-s-3 flex items-center text-muted peer-disabled:opacity-50'

/** The spinner at the inline end while a page loads. */
export const COMBOBOX_ICON = 'pointer-events-none absolute inset-y-0 inset-e-3 flex items-center text-muted peer-disabled:opacity-50'

export const COMBOBOX_SPIN = 'flex animate-spin motion-reduce:animate-none'

export const COMBOBOX_POSITIONER = 'z-(--tc-z-popup) data-anchor-hidden:invisible'

/** As wide as the input, and capped on both axes as Select's popup is: capped on the list alone, its line crossed the padding. */
export const COMBOBOX_POPUP = `flex w-(--anchor-width) ${POPUP_BOUNDS} flex-col ${OVERLAY_SURFACE} ${POPUP_MOTION}`

/** No gap between rows: the window counts rows only. The two spacers are pseudo-elements; min-h-0 lets the popup's cap shrink it. */
export const COMBOBOX_LIST = `relative flex min-h-0 flex-col p-1.5 outline-none empty:hidden before:h-(--tc-list-pad-start) before:shrink-0 after:h-(--tc-list-pad-end) after:shrink-0 ${LIST_CAP} ${SCROLL_AREA}`

/** Every row exactly one unit tall, 44 px at least under a finger: the spacers stand for whole rows. */
export const COMBOBOX_UNIT = 'h-(--tc-row-height)'

/** The active row: a fill, and a line inside its edge, since the fill alone is under 3:1 against the popup. */
export const COMBOBOX_ACTIVE = 'data-highlighted:outline-solid data-highlighted:outline-(length:--tc-ring-width) data-highlighted:-outline-offset-(length:--tc-ring-width) data-highlighted:outline-primary-on-soft forced-colors:data-highlighted:outline-[HighlightText]'

export const COMBOBOX_ITEM = `shrink-0 select-none ${ROW} ${ROW_HIGHLIGHT} ${ROW_TOUCH} ${ROW_SELECTED} ${COMBOBOX_UNIT} ${COMBOBOX_ACTIVE} ${DISABLED}`

export const COMBOBOX_ITEM_TEXT = `${LABEL} flex-1`

export const COMBOBOX_ITEM_TICK = 'ms-auto flex shrink-0'

/** The empty text and the status line. Live regions stay mounted and visible, so with nothing to say they take no room. */
export const COMBOBOX_NOTE = 'px-3 py-2 text-sm text-muted empty:p-0'
