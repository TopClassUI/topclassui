// R-5.12-4: Banner's own class tables, read by variants.ts and index.tsx.
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
