/** R-5.12-4: Badge's own class tables. A chip is tighter than a control, so its size
 * table is its own; the per-tone fills and the skeleton width are Badge's too. */
import type { Size } from '#shared/contracts/size.js'
import type { Tone } from '#shared/contracts/tone.js'

/** R-5.2-3: a lookup of complete class strings, never a name built from an expression. */
export const ON_SOLID = {
  primary: 'bg-primary-solid text-primary-on-solid border-transparent',
  neutral: 'bg-neutral-solid text-neutral-on-solid border-transparent',
  success: 'bg-success-solid text-success-on-solid border-transparent',
  warning: 'bg-warning-solid text-warning-on-solid border-transparent',
  danger: 'bg-danger-solid text-danger-on-solid border-transparent',
  info: 'bg-info-solid text-info-on-solid border-transparent',
} as const satisfies Record<Tone, string>

export const ON_SOFT = {
  primary: 'bg-primary-soft text-primary-on-soft border-transparent',
  neutral: 'bg-neutral-soft text-neutral-on-soft border-transparent',
  success: 'bg-success-soft text-success-on-soft border-transparent',
  warning: 'bg-warning-soft text-warning-on-soft border-transparent',
  danger: 'bg-danger-soft text-danger-on-soft border-transparent',
  info: 'bg-info-soft text-info-on-soft border-transparent',
} as const satisfies Record<Tone, string>

/** No fill: the border takes the text colour, so one token paints both. */
export const ON_OUTLINE = {
  primary: 'text-primary-on-soft border-current',
  neutral: 'text-neutral-on-soft border-current',
  success: 'text-success-on-soft border-current',
  warning: 'text-warning-on-soft border-current',
  danger: 'text-danger-on-soft border-current',
  info: 'text-info-on-soft border-current',
} as const satisfies Record<Tone, string>

/** The drawn inline padding is twice padding-y at every size, so it is not pad-x. The line is
 * tight, as Figma draws the chip (29 px at md): 16 on a 14 px label, not text-sm's 20. At xs the
 * border sits inside the drawn padding, 15 px on a 12 px label: 19 px, as drawn. */
export const BADGE_SIZE = {
  xs: 'px-1 py-[calc(var(--spacing-pad-y-xs)-var(--tc-line-width))] gap-1 text-xs/3.75',
  sm: 'px-2 py-pad-y-sm gap-1.5 text-sm/4',
  md: 'px-3 py-pad-y-md gap-2 text-sm/4',
  lg: 'px-4 py-pad-y-lg gap-2 text-base/5',
  xl: 'px-5 py-pad-y-xl gap-3 text-lg/6',
  custom: '',
} as const satisfies Record<Size, string>

/** Width only: the height comes from BADGE_SIZE, so the two cannot drift apart. */
export const SKELETON_WIDTH = {
  xs: 'w-12', sm: 'w-14', md: 'w-16', lg: 'w-20', xl: 'w-24', custom: '',
} as const satisfies Record<Size, string>
