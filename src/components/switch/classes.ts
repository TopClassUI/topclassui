// R-5.12-4: the class strings of the switch, built from the shared toggle constants (unit-4.md, Switch).
import { FORCED_EDGE, TOGGLE_BOX, TOGGLE_INVALID, TOGGLE_ON, TOGGLE_TARGET, TOUCH_TARGET, TRANSITION } from '#shared/classes.js'

/** The button that takes the press: 24 px, 44 under a coarse pointer, as wide as its track. */
export const SWITCH_ROOT = TOGGLE_TARGET

/** The track. Its line stays when it is on, in the colour of the fill, so nothing moves. */
export const SWITCH_TRACK = `rounded-full bg-neutral-soft p-px ${TOGGLE_BOX} ${TOGGLE_ON} ${TOGGLE_INVALID}`

/** The heights of the toggle scale, and 1.75 times that as the width. Custom sizes nothing (R-5.7-2): the caller's CSS does,
 * and the track is a container so the thumb can measure it. */
export const SWITCH_TRACK_SIZE = {
  xs: 'h-toggle-xs w-[calc(1.53125rem*var(--tc-density))]',
  sm: 'h-toggle-sm w-[calc(1.75rem*var(--tc-density))]',
  md: 'h-toggle-md w-[calc(2.1875rem*var(--tc-density))]',
  lg: 'h-toggle-lg w-[calc(2.625rem*var(--tc-density))]',
  xl: 'h-toggle-xl w-[calc(3.0625rem*var(--tc-density))]',
  custom: '@container',
} as const

/** As tall as the inside of the track. Off it is line-strong, 3:1 on the track, where the drawn surface-raised is 1.2:1.
 * Forced colours erase a fill, so there it is a system colour. */
export const SWITCH_THUMB = `block aspect-square h-full rounded-full bg-line-strong group-data-checked/toggle:bg-primary-on-solid forced-colors:forced-color-adjust-none forced-colors:bg-[ButtonText] forced-colors:group-data-checked/toggle:bg-[HighlightText] ${TRANSITION}`

/** R-5.3-2: the width minus the height, toward the inline end. Custom measures it: the track's inside less the thumb. */
export const SWITCH_SLIDE = {
  xs: 'group-data-checked/toggle:translate-x-[calc(0.65625rem*var(--tc-density)*var(--tc-dir))]',
  sm: 'group-data-checked/toggle:translate-x-[calc(0.75rem*var(--tc-density)*var(--tc-dir))]',
  md: 'group-data-checked/toggle:translate-x-[calc(0.9375rem*var(--tc-density)*var(--tc-dir))]',
  lg: 'group-data-checked/toggle:translate-x-[calc(1.125rem*var(--tc-density)*var(--tc-dir))]',
  xl: 'group-data-checked/toggle:translate-x-[calc(1.3125rem*var(--tc-density)*var(--tc-dir))]',
  custom: 'group-data-checked/toggle:translate-x-[calc((100cqw-100%)*var(--tc-dir))]',
} as const

/** The skeleton's target: the floor of the button it stands in for, 24 px and 44 under a finger, around the track. */
export const SWITCH_SKELETON = `inline-flex w-fit shrink-0 items-center justify-center ${TOUCH_TARGET}`

/** The track's own box in the neutral fill, which pulses. Its size is SWITCH_TRACK_SIZE, as the switch's is. */
export const SWITCH_SKELETON_TRACK = `block rounded-full bg-neutral-soft animate-pulse motion-reduce:animate-none ${FORCED_EDGE}`
