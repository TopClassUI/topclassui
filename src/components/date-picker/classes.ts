// R-5.12-4: the class strings of the DatePicker, built from the shared field and overlay constants (unit-5.md, DatePicker).
import {
  FIELD_BOX, FIELD_HOLDER, FOCUS_RING, FOCUS_RING_INSET, HOVER, ICON_BUTTON, LABEL, OVERLAY_SURFACE, POPUP_MOTION,
  SCROLL_AREA, TARGET_HEIGHT, TRANSITION,
} from '#shared/classes.js'

/** The box that owns the width, as Select's. relative: it holds the form input. */
export const DATE_PICKER_ROOT = `relative inline-grid align-middle ${FIELD_HOLDER}`
export const DATE_PICKER_TRIGGER = `inline-flex w-full items-center gap-2 text-start ${FIELD_BOX}`
export const DATE_PICKER_ICON = 'flex shrink-0 text-muted'
export const DATE_PICKER_VALUE = `${LABEL} flex-1 data-placeholder:text-muted`
/** The form's copy of the value: out of sight and out of the tab order, still checked by required. */
export const DATE_PICKER_INPUT = 'sr-only'
export const DATE_PICKER_POSITIONER = 'z-(--tc-z-popup) data-anchor-hidden:invisible'
/** 280 px as drawn, never wider than the room Base UI measured; on a short screen it scrolls itself. */
export const DATE_PICKER_POPUP = [
  // Capped in px: at a 32 px root a rem padding left two digits 26 px.
  'flex w-[calc(17.5rem*var(--tc-density))] max-w-(--available-width) max-h-(--available-height) flex-col gap-3 p-[min(1rem,16px)] tone-neutral',
  '*:shrink-0',
  SCROLL_AREA,
  OVERLAY_SURFACE,
  POPUP_MOTION,
  FOCUS_RING_INSET,
].join(' ')
export const DATE_PICKER_HEADER = 'flex items-center gap-2'
/** Three 44 px buttons under a finger leave about 92 px at 320 px: the month wraps, never cut. */
export const DATE_PICKER_TITLE = 'min-w-0 flex-1 text-center text-sm font-semibold text-body wrap-anywhere'
/** Dimmed and deaf to the pointer, and still focusable: a month button at the range's end keeps the focus it had. */
const ARIA_DISABLED = 'aria-disabled:pointer-events-none aria-disabled:opacity-50'
/** Previous, next and close: 24 px, 44 under a finger, where the drawing has bare 14 px carets. */
export const DATE_PICKER_NAV = `${ICON_BUTTON} text-body ${HOVER.ghost} ${ARIA_DISABLED}`
export const DATE_PICKER_GRID = 'w-full table-fixed border-collapse'
export const DATE_PICKER_WEEKDAY = 'pb-1 text-center text-xs font-medium text-muted'
export const DATE_PICKER_CELL = 'p-[min(0.125rem,2px)] text-center'
/** A day: 32 px tall and 44 under a finger, as wide as its column. Selected is a fill, a weight and an inset line at 3:1
 * on the surface in every mode, where the dark fill alone is 2.57:1; today an underline. */
export const DATE_PICKER_DAY = [
  'inline-flex h-control-sm w-full items-center justify-center rounded-control text-sm tabular-nums text-body',
  TARGET_HEIGHT,
  FOCUS_RING,
  TRANSITION,
  HOVER.ghost,
  'data-selected:bg-primary-solid data-selected:font-medium data-selected:text-primary-on-solid',
  'data-selected:inset-ring-(length:--tc-line-width) data-selected:inset-ring-primary-on-soft',
  'forced-colors:data-selected:forced-color-adjust-none forced-colors:data-selected:bg-[Highlight] forced-colors:data-selected:text-[HighlightText]',
  'forced-colors:data-selected:inset-ring-[color:Highlight]',
  // Opted out of forced colours, the ring would keep the theme's violet: 2.9:1 on a Canvas of the other lightness.
  'forced-colors:data-selected:[--tc-ring:CanvasText]',
  'aria-[current=date]:font-semibold aria-[current=date]:underline aria-[current=date]:underline-offset-4',
  ARIA_DISABLED,
].join(' ')
