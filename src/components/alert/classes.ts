/** R-5.12-4: Alert's own class tables, one per variant. The icon, the title and the
 * description inherit the one text colour each cell sets. */
import type { Tone } from '#shared/contracts/tone.js'

/** R-5.2-3: a lookup of complete class strings, never a name built from an expression. */
export const ON_SOFT = {
  primary: 'bg-primary-soft text-primary-on-soft border-transparent',
  neutral: 'bg-neutral-soft text-neutral-on-soft border-transparent',
  success: 'bg-success-soft text-success-on-soft border-transparent',
  warning: 'bg-warning-soft text-warning-on-soft border-transparent',
  danger: 'bg-danger-soft text-danger-on-soft border-transparent',
  info: 'bg-info-soft text-info-on-soft border-transparent',
} as const satisfies Record<Tone, string>

export const ON_SOLID = {
  primary: 'bg-primary-solid text-primary-on-solid border-transparent',
  neutral: 'bg-neutral-solid text-neutral-on-solid border-transparent',
  success: 'bg-success-solid text-success-on-solid border-transparent',
  warning: 'bg-warning-solid text-warning-on-solid border-transparent',
  danger: 'bg-danger-solid text-danger-on-solid border-transparent',
  info: 'bg-info-solid text-info-on-solid border-transparent',
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
