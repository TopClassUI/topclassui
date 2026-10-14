// R-5.12-4: Banner's own class tables, read by variants.ts, index.tsx and client.tsx.
import { HOVER, ICON_BUTTON } from '#shared/classes.js'
import type { Tone } from '#shared/contracts/tone.js'

/** The message keeps a readable width; below it the action wraps to a line of its own. */
export const MESSAGE = 'min-w-0 grow basis-40'

/** Forced colours remove the fill, the only thing that marks the row, so an edge shows there alone. */
export const FORCED_EDGE = 'forced-colors:border-b-(length:--tc-line-width)'

/** R-5.2-3: a lookup of complete class strings, never a name built from an expression. */
export const ON_SOFT = {
  primary: 'bg-primary-soft text-primary-on-soft',
  neutral: 'bg-neutral-soft text-neutral-on-soft',
  success: 'bg-success-soft text-success-on-soft',
  warning: 'bg-warning-soft text-warning-on-soft',
  danger: 'bg-danger-soft text-danger-on-soft',
  info: 'bg-info-soft text-info-on-soft',
} as const satisfies Record<Tone, string>

/** The x. `ms-auto` keeps it at the inline end of whatever line it wraps to. Forced colours erase
 * the hover fill, so there a hovered x draws an outline instead. */
export const DISMISS = [
  ICON_BUTTON,
  HOVER.soft,
  'ms-auto',
  'forced-colors:hover:outline-solid forced-colors:hover:outline-(length:--tc-line-width)',
].join(' ')

/** The hover reads the tint of the banner's own tone, one step darker than its fill. */
export const DISMISS_TONE = {
  primary: 'tone-primary',
  neutral: 'tone-neutral',
  success: 'tone-success',
  warning: 'tone-warning',
  danger: 'tone-danger',
  info: 'tone-info',
} as const satisfies Record<Tone, string>
