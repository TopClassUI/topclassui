/**
 * R-5.12-4: Button's own class tables, read by variants.ts and skeleton.tsx. The shared
 * constants in #shared/classes.js cover height, radius, the ring and the interaction
 * ramp; only the per-tone fills and the skeleton width are specific to this control.
 */
import type { Size } from '#shared/contracts/size.js'
import type { Tone } from '#shared/contracts/tone.js'

/** R-5.2-3: a lookup of complete class strings, never a name built from an expression. */
export const ON_SOLID = {
  primary: 'bg-primary-solid text-primary-on-solid',
  neutral: 'bg-neutral-solid text-neutral-on-solid',
  success: 'bg-success-solid text-success-on-solid',
  warning: 'bg-warning-solid text-warning-on-solid',
  danger: 'bg-danger-solid text-danger-on-solid',
  info: 'bg-info-solid text-info-on-solid',
} as const satisfies Record<Tone, string>

export const ON_SOFT = {
  primary: 'bg-primary-soft text-primary-on-soft',
  neutral: 'bg-neutral-soft text-neutral-on-soft',
  success: 'bg-success-soft text-success-on-soft',
  warning: 'bg-warning-soft text-warning-on-soft',
  danger: 'bg-danger-soft text-danger-on-soft',
  info: 'bg-info-soft text-info-on-soft',
} as const satisfies Record<Tone, string>

/** outline, ghost and link have no fill, so only the tone's text colour applies. */
export const TONE_TEXT = {
  primary: 'text-primary-on-soft',
  neutral: 'text-neutral-on-soft',
  success: 'text-success-on-soft',
  warning: 'text-warning-on-soft',
  danger: 'text-danger-on-soft',
  info: 'text-info-on-soft',
} as const satisfies Record<Tone, string>

/** Width only: the height comes from CONTROL_HEIGHT, so the two cannot drift apart. */
export const SKELETON_WIDTH = {
  xs: 'w-16', sm: 'w-20', md: 'w-24', lg: 'w-28', xl: 'w-32', custom: '',
} as const satisfies Record<Size, string>
