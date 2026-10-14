// R-5.12-4: the class strings of the switch, built from the shared toggle constants (unit-4.md, Switch).
import { TOGGLE_BOX, TOGGLE_INVALID, TOGGLE_ON, TOGGLE_TARGET, TRANSITION } from '#shared/classes.js'

/** The button that takes the press: 24 px, 44 under a coarse pointer, as wide as its track. */
export const SWITCH_ROOT = TOGGLE_TARGET

/** The track. Its line stays when it is on, in the colour of the fill, so nothing moves. */
export const SWITCH_TRACK = `rounded-full bg-neutral-soft p-px ${TOGGLE_BOX} ${TOGGLE_ON} ${TOGGLE_INVALID}`

/** The heights of the toggle scale, and 1.75 times that as the width. */
export const SWITCH_TRACK_SIZE = {
  xs: 'h-toggle-xs w-[calc(1.53125rem*var(--tc-density))]',
  sm: 'h-toggle-sm w-[calc(1.75rem*var(--tc-density))]',
  md: 'h-toggle-md w-[calc(2.1875rem*var(--tc-density))]',
  lg: 'h-toggle-lg w-[calc(2.625rem*var(--tc-density))]',
  xl: 'h-toggle-xl w-[calc(3.0625rem*var(--tc-density))]',
  custom: '',
} as const

/** As tall as the inside of the track. Forced colours erase a fill, so there it is a system colour. */
export const SWITCH_THUMB = `block aspect-square h-full rounded-full bg-surface-raised group-data-checked/toggle:bg-primary-on-solid forced-colors:forced-color-adjust-none forced-colors:bg-[ButtonText] forced-colors:group-data-checked/toggle:bg-[HighlightText] ${TRANSITION}`

/** R-5.3-2: the width minus the height, toward the inline end. */
export const SWITCH_SLIDE = {
  xs: 'group-data-checked/toggle:translate-x-[calc(0.65625rem*var(--tc-density)*var(--tc-dir))]',
  sm: 'group-data-checked/toggle:translate-x-[calc(0.75rem*var(--tc-density)*var(--tc-dir))]',
  md: 'group-data-checked/toggle:translate-x-[calc(0.9375rem*var(--tc-density)*var(--tc-dir))]',
  lg: 'group-data-checked/toggle:translate-x-[calc(1.125rem*var(--tc-density)*var(--tc-dir))]',
  xl: 'group-data-checked/toggle:translate-x-[calc(1.3125rem*var(--tc-density)*var(--tc-dir))]',
  custom: '',
} as const
