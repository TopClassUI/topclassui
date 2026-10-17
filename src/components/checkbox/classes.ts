// R-5.12-4: the class strings of the checkbox, built from the shared toggle constants (unit-4.md, Checkbox).
import { FORCED_EDGE, TOGGLE_BOX, TOGGLE_INVALID, TOGGLE_ON, TOGGLE_SIZE, TOGGLE_TARGET, TOUCH_TARGET } from '#shared/classes.js'

/** The button that takes the press: 24 px, 44 under a coarse pointer, whatever size the box is. */
export const CHECKBOX_ROOT = TOGGLE_TARGET

/** The square sizes of the toggle scale: 14, 16, 20, 24 and 28 px. */
export const CHECKBOX_SIZE = TOGGLE_SIZE

/** Indeterminate is filled as checked is, forced colours too: Base UI then sets neither data-checked nor data-unchecked. */
export const CHECKBOX_MIXED = 'group-data-indeterminate/toggle:border-primary-solid group-data-indeterminate/toggle:bg-primary-solid group-data-indeterminate/toggle:text-primary-on-solid forced-colors:group-data-indeterminate/toggle:forced-color-adjust-none forced-colors:group-data-indeterminate/toggle:border-[Highlight] forced-colors:group-data-indeterminate/toggle:bg-[Highlight] forced-colors:group-data-indeterminate/toggle:text-[HighlightText] group-aria-invalid/toggle:group-data-indeterminate/toggle:border-danger-solid forced-colors:group-aria-invalid/toggle:group-data-indeterminate/toggle:border-[CanvasText] forced-colors:group-disabled/toggle:group-data-indeterminate/toggle:border-[GrayText] forced-colors:group-disabled/toggle:group-data-indeterminate/toggle:bg-[GrayText]'

/** The drawn box. Its line stays when it is filled, in the colour of the fill, so the mark never moves. */
export const CHECKBOX_BOX = `rounded-chip bg-surface-raised ${TOGGLE_BOX} ${TOGGLE_ON} ${TOGGLE_INVALID} ${CHECKBOX_MIXED}`

/** Base UI's Indicator, mounted only while the box is checked or indeterminate: it centres the mark. */
export const CHECKBOX_MARK = 'flex size-full items-center justify-center'

/** The skeleton's target: the floor of the button it stands in for, 24 px and 44 under a finger, around the box. */
export const CHECKBOX_SKELETON = `inline-flex w-fit shrink-0 items-center justify-center ${TOUCH_TARGET}`

/** The box's own radius in the neutral fill, which pulses. Its size is CHECKBOX_SIZE, as the checkbox's is. */
export const CHECKBOX_SKELETON_BOX = `block rounded-chip bg-neutral-soft animate-pulse motion-reduce:animate-none ${FORCED_EDGE}`
