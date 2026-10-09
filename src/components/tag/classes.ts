/** R-5.12-4: Tag's own class tables. A chip is tighter than a control, so its size
 * table is its own, and a tag is only ever drawn on the soft pair of its tone. */
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

/** An element label, or bare text on a tagVariants() anchor, is cut at the chip on one line
 * instead of widening the page. shrink-0, or the clip leaves a flex item no minimum size:
 * a row crushed a 55 px tag to 36 beside wrapping text, and a column squashed it to 14 tall. */
export const CLIP = 'overflow-hidden whitespace-nowrap shrink-0'

/** The drawn inline padding is twice padding-y at every size, so it is not pad-x. */
export const TAG_SIZE = {
  xs: 'px-1 py-pad-y-xs gap-1 text-xs',
  sm: 'px-2 py-pad-y-sm gap-1.5 text-sm',
  md: 'px-3 py-pad-y-md gap-2 text-sm',
  lg: 'px-4 py-pad-y-lg gap-2 text-base',
  xl: 'px-5 py-pad-y-xl gap-3 text-lg',
  custom: '',
} as const satisfies Record<Size, string>
