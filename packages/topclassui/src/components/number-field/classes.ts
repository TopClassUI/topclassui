// R-5.12-4: the class strings of the number field, built from the shared field constants (unit-4.md, NumberField).
import {
  DISABLED, FIELD_HOLDER, FIELD_INVALID_WITHIN, FIELD_SURFACE, FOCUS_RING_INSET, FOCUS_RING_WITHIN, HOVER, TARGET_HEIGHT,
  TOUCH_TARGET, TRANSITION,
} from '#shared/classes.js'

/** The box that owns the width. As an inline block with a width of its own it could not shrink: the input inside keeps the browser's width as a floor. */
export const NUMBER_FIELD_ROOT = `inline-grid align-middle ${FIELD_HOLDER}`

/** The box of the field. Its ring shows while the input inside it has the focus. It dims the whole field when disabled, by the prop or by a disabled fieldset, which Base UI never hears of; a stepper at its limit is disabled too, so the test is on the input. */
export const NUMBER_FIELD_GROUP = `group/number flex w-full items-stretch overflow-hidden ${FIELD_SURFACE} ${FOCUS_RING_WITHIN} ${TARGET_HEIGHT} ${FIELD_INVALID_WITHIN} data-disabled:opacity-50 has-[input:disabled]:opacity-50 data-readonly:bg-neutral-soft`

/** It reaches over the line of the box, or it is 42 px tall on touch and the shared spec refuses it. */
export const NUMBER_FIELD_INPUT = `-my-(--tc-line-width) min-w-0 flex-1 bg-transparent px-1 text-center tabular-nums outline-none placeholder:text-muted ${TARGET_HEIGHT}`

/** The input comes first in the markup, so a label that wraps the field names and focuses it, not the decrease button; flex order puts decrease back at the inline start. */
export const NUMBER_FIELD_DECREASE = 'order-first'

/** DISABLED dims a stepper at its limit. In a disabled field the box already dims it, and opacity multiplies. A read-only stepper has no disabled attribute, so it is dimmed by name. */
export const NUMBER_FIELD_STEP = `-my-(--tc-line-width) inline-flex aspect-square shrink items-center justify-center text-body tone-neutral ${HOVER.ghost} ${FOCUS_RING_INSET} ${TOUCH_TARGET} ${TRANSITION} ${DISABLED} data-readonly:pointer-events-none data-readonly:opacity-50 group-data-disabled/number:disabled:opacity-100 group-has-[input:disabled]/number:disabled:opacity-100`
