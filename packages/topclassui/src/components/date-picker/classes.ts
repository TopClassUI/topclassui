// R-5.12-4: the class strings of the DatePicker, built from the shared field and overlay constants (unit-5.md, DatePicker).
import {
  FIELD_BOX, FIELD_HOLDER, FOCUS_RING, FOCUS_RING_INSET, HOVER, ICON_BUTTON, LABEL, OVERLAY_SURFACE, POINTER,
  POPUP_BOUNDS, POPUP_MOTION, SCROLL_AREA, TARGET_HEIGHT, TRANSITION,
} from '#shared/classes.js'

/** The box that owns the width, as Select's. relative: it holds the form input. */
export const DATE_PICKER_ROOT = `relative inline-grid align-middle ${FIELD_HOLDER}`
export const DATE_PICKER_TRIGGER = `inline-flex w-full items-center gap-2 text-start ${FIELD_BOX} ${POINTER}`
export const DATE_PICKER_ICON = 'flex shrink-0 text-muted'
export const DATE_PICKER_VALUE = `${LABEL} flex-1 data-placeholder:text-muted`
/** The form's copy of the value: out of sight and out of the tab order, still checked by required. */
export const DATE_PICKER_INPUT = 'sr-only'
export const DATE_PICKER_POSITIONER = 'z-(--tc-z-popup) data-anchor-hidden:invisible'
/** 280 px as drawn, never wider or taller than the room Base UI measured: the grid scrolls under the month,
 * and on a short screen the popup scrolls as one. */
export const DATE_PICKER_POPUP = [
  // The side padding gives up what a narrow screen takes from the drawn width: at a 32 px root the days need it.
  'flex w-[calc(17.5rem*var(--tc-density))] flex-col gap-3 tone-neutral',
  POPUP_BOUNDS,
  'py-[min(1rem,16px)] px-[clamp(4px,calc(1rem-(17.5rem*var(--tc-density)-var(--available-width,100vw))/2),min(1rem,16px))]',
  SCROLL_AREA,
  OVERLAY_SURFACE,
  POPUP_MOTION,
  FOCUS_RING_INSET,
].join(' ')
/** It never shrinks, so it keeps its box while the grid scrolls. */
export const DATE_PICKER_HEADER = 'flex shrink-0 items-center gap-2'
/** Three 44 px buttons under a finger leave about 92 px at 320 px: the month wraps, never cut. */
export const DATE_PICKER_TITLE = 'min-w-0 flex-1 text-center text-sm font-semibold text-body wrap-anywhere'
/** Dimmed and deaf to the pointer, and still focusable: a month button at the range's end keeps the focus it had. */
const ARIA_DISABLED = 'aria-disabled:pointer-events-none aria-disabled:opacity-50'
/** Previous, next and close: 24 px, 44 under a finger, where the drawing has bare 14 px carets. */
export const DATE_PICKER_NAV = `${ICON_BUTTON} text-body ${HOVER.ghost} ${ARIA_DISABLED}`
/** Under 20rem of screen (320 px) the room beside a trigger leaves the grid a row or less. It stops scrolling and the
 * popup scrolls as one, or a wheel that starts on the grid ends inside it. Not @container: nothing measures the room. */
export const DATE_PICKER_SCROLL_SHORT = '[@media(height<20rem)]:shrink-0 [@media(height<20rem)]:overflow-y-visible'
/** R-10.5-1: the scroll container, since a table cannot be one. It reaches into the popup's padding by the width of a
 * day's ring and pads it back, so a day at its edge keeps its ring whole. */
export const DATE_PICKER_SCROLL = [
  'min-h-0 -m-[calc(var(--tc-ring-width)+var(--tc-ring-offset))] p-[calc(var(--tc-ring-width)+var(--tc-ring-offset))]',
  SCROLL_AREA,
  FOCUS_RING_INSET,
  DATE_PICKER_SCROLL_SHORT,
].join(' ')
export const DATE_PICKER_GRID = 'w-full table-fixed border-collapse'
export const DATE_PICKER_WEEKDAY = 'pb-1 text-center text-xs font-medium text-muted'
export const DATE_PICKER_CELL = 'px-0 py-[min(0.125rem,2px)] text-center'
/** A day: 32 px tall and 44 under a finger, as wide as its column. Selected is a fill, a weight and an inset line at 3:1
 * on the surface in every mode, where the dark fill alone is 2.88:1; today an underline. */
export const DATE_PICKER_DAY = [
  'inline-flex h-control-sm w-full items-center justify-center rounded-control text-sm tabular-nums text-body',
  TARGET_HEIGHT,
  FOCUS_RING,
  POINTER,
  TRANSITION,
  HOVER.ghost,
  'data-selected:bg-primary-solid data-selected:font-medium data-selected:text-primary-on-solid',
  'data-selected:inset-ring-(length:--tc-line-width) data-selected:inset-ring-primary-on-soft',
  'forced-colors:data-selected:forced-color-adjust-none forced-colors:data-selected:bg-[Highlight] forced-colors:data-selected:text-[HighlightText]',
  'forced-colors:data-selected:inset-ring-[color:Highlight]',
  // Opted out of forced colours, the ring would keep the theme's blue: 2.4:1 on a Canvas of the other lightness.
  'forced-colors:data-selected:[--tc-ring:CanvasText]',
  'aria-[current=date]:font-semibold aria-[current=date]:underline aria-[current=date]:underline-offset-4',
  ARIA_DISABLED,
].join(' ')
