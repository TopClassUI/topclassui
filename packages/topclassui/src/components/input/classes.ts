/** R-5.12-4: Input's own class strings. The field strings are shared now, so the fields of
 * Unit 4 draw the same box; Input keeps them under its old names. */
import {
  BORDER_WIDTH, CONTAIN, FIELD_LTR, FIELD_OWN_WIDTH, FIELD_SIZE, TOUCH_TARGET,
} from '#shared/classes.js'
import type { Size } from '#shared/contracts/size.js'

/** The browser's own width is a fixed minimum: two of them in a grid form measured 426px on
 * a 320px phone. A definite width is never stretched, so a grid or a column no longer fills it: fullWidth does. */
export const INPUT_OWN_WIDTH = FIELD_OWN_WIDTH

/** Its placeholder keeps the order of its own script, so an Arabic hint on an email field still ends correctly. */
export const INPUT_LTR = FIELD_LTR

/** The shared scale plus the touch floor for the text. `custom` still emits nothing. */
export const INPUT_SIZE = FIELD_SIZE satisfies Record<Size, string>

/** The field's box model around one line of nothing: its border width, its floor and its
 * baseline, so a flex row or a line of text lays the placeholder out as it lays the field. */
export const INPUT_SKELETON = [
  'inline-flex items-center',
  `${BORDER_WIDTH} border-transparent`,
  CONTAIN,
  TOUCH_TARGET,
  'animate-pulse rounded-control bg-neutral-soft motion-reduce:animate-none',
].join(' ')
