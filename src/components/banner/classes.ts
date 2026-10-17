// R-5.12-4: Banner's own class tables, read by variants.ts, index.tsx and client.tsx.
import { FORCED_EDGE as FORCED_OUTLINE, HOVER, ICON_BUTTON, TOUCH_TARGET } from '#shared/classes.js'
import type { Tone } from '#shared/contracts/tone.js'

/** The message keeps a readable width; below it the action wraps to a line of its own. */
export const MESSAGE = 'min-w-0 grow basis-40'

/** Forced colours remove the fill, the only thing that marks the row, so an edge shows there alone. */
export const FORCED_EDGE = 'forced-colors:border-b-(length:--tc-line-width)'

/** Edge to edge, so no radius or border; it wraps a long action under the message, and min-w-0 lets a track stay narrow. */
export const BANNER_BOX = `flex w-full min-w-0 flex-wrap items-center gap-3 px-5 py-3 text-sm ${FORCED_EDGE}`

/** The plain surface, not a tone: a loading banner has no meaning yet, and its bars need a fill to stand on. */
export const BANNER_SKELETON = `${BANNER_BOX} bg-surface`

const PULSE = `bg-neutral-soft animate-pulse motion-reduce:animate-none ${FORCED_OUTLINE}`

/** One line of nothing where the message goes: as tall as the type, with margins making up the line height. */
export const BANNER_SKELETON_BAR = `block h-[1em] my-[calc((1lh-1em)/2)] w-full max-w-80 rounded-chip ${PULSE}`

/** The box of the x: its floor under every pointer, at the inline end, so a dismissible banner keeps its height. */
export const BANNER_SKELETON_DISMISS = `inline-flex shrink-0 ms-auto rounded-control ${TOUCH_TARGET} ${PULSE}`

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
