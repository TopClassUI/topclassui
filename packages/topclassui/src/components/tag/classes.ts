/** R-5.12-4: Tag's own class tables. A chip is tighter than a control, so its size
 * table is its own, and a tag is only ever drawn on the soft pair of its tone. */
import { DISABLED, FOCUS_RING, HOVER, ICON_BUTTON, LABEL, TOUCH_TARGET, TRANSITION } from '#shared/classes.js'
import type { Size } from '#shared/contracts/size.js'
import type { Tone } from '#shared/contracts/tone.js'

/** R-5.2-3: complete class strings. The border is transparent: it only holds the height. */
export const ON_SOFT = {
  primary: 'bg-primary-soft text-primary-on-soft border-transparent',
  neutral: 'bg-neutral-soft text-neutral-on-soft border-transparent',
  success: 'bg-success-soft text-success-on-soft border-transparent',
  warning: 'bg-warning-soft text-warning-on-soft border-transparent',
  danger: 'bg-danger-soft text-danger-on-soft border-transparent',
  info: 'bg-info-soft text-info-on-soft border-transparent',
} as const satisfies Record<Tone, string>

/** A tag that is a link: Figma 135:285 draws its hover and active tints, the ring and the dimmed disabled chip. */
export const TAG_INTERACTIVE = `cursor-pointer ${HOVER.soft} ${FOCUS_RING} ${TOUCH_TARGET} ${TRANSITION} ${DISABLED}`

/** An element label, or bare text on a tagVariants() anchor, is cut at the chip on one line
 * instead of widening the page. shrink-0, or the clip leaves a flex item no minimum size:
 * a row crushed a 55 px tag to 36 beside wrapping text, and a column squashed it to 14 tall. */
export const CLIP = 'overflow-hidden whitespace-nowrap shrink-0'

/** The drawn inline padding is twice padding-y at every size, so it is not pad-x. The line is
 * tight, as Figma draws the chip (29 px at md): 16 on a 14 px label, not text-sm's 20. */
export const TAG_SIZE = {
  xs: 'px-1 py-pad-y-xs gap-1 text-xs',
  sm: 'px-2 py-pad-y-sm gap-1.5 text-sm/4',
  md: 'px-3 py-pad-y-md gap-2 text-sm/4',
  lg: 'px-4 py-pad-y-lg gap-2 text-base/5',
  xl: 'px-5 py-pad-y-xl gap-3 text-lg/6',
  custom: '',
} as const satisfies Record<Size, string>

// The removable tag: its label clips itself, so the chip stops clipping and never cuts the ring of its button.

/** A label column that starts at 0, so a long label never sets the least width of a flex column or a table cell. */
export const REMOVABLE = 'inline-grid grid-cols-[minmax(0,auto)_auto] overflow-visible'

/** The end padding drops to the block padding, as drawn: the button brings its own room. */
export const REMOVABLE_END = {
  xs: 'pe-pad-y-xs',
  sm: 'pe-pad-y-sm',
  md: 'pe-pad-y-md',
  lg: 'pe-pad-y-lg',
  xl: 'pe-pad-y-xl',
  custom: '',
} as const satisfies Record<Size, string>

/** The one element that holds the label and names the button; an icon in it keeps the gap of the chip. */
export const TAG_LABEL = `${LABEL} flex items-center gap-[inherit]`

/** Forced colours erase the hover tint, so a hovered x takes the system pair and paints it itself. */
export const REMOVE_FORCED = 'forced-colors:hover:forced-color-adjust-none forced-colors:hover:bg-[Highlight] forced-colors:hover:text-[HighlightText]'

/** The x: a 24 px target, 44 under a finger, on the tint of its own tag. */
export const TAG_REMOVE = `${ICON_BUTTON} ${HOVER.soft} ${REMOVE_FORCED}`

/** The button reaches over the block padding and the border, so it sets the height only where it is taller. */
export const REMOVE_SIZE = {
  xs: '-my-[calc(var(--spacing-pad-y-xs)+var(--tc-line-width))]',
  sm: '-my-[calc(var(--spacing-pad-y-sm)+var(--tc-line-width))]',
  md: '-my-[calc(var(--spacing-pad-y-md)+var(--tc-line-width))]',
  lg: '-my-[calc(var(--spacing-pad-y-lg)+var(--tc-line-width))]',
  xl: '-my-[calc(var(--spacing-pad-y-xl)+var(--tc-line-width))]',
  custom: '',
} as const satisfies Record<Size, string>
