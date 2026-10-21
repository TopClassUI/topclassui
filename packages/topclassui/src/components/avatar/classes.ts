// R-5.12-4: Avatar's own class strings, one per part. The box is the shared control scale.
import type { Size } from '#shared/contracts/size.js'

/** A circle is a shape, not a radius knob: written once, for the root and its skeleton. */
export const AVATAR_CIRCLE = 'rounded-full'

/** Forced colours remove every fill, so the shape keeps a system-colour line there and nowhere else. */
export const AVATAR_FORCED_EDGE = 'forced-colors:outline-(length:--tc-line-width)'

/** Clipped to the circle, and the positioning context AvatarImage is laid over. */
export const AVATAR_ROOT = [
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden',
  AVATAR_CIRCLE,
  // Figma 137:461 and 137:572: a neutral disc; only AvatarGroup's counter wears the primary tint.
  'bg-neutral-soft text-neutral-on-soft font-medium',
  AVATAR_FORCED_EDGE,
].join(' ')

/** R-5.2-3: the control height on both axes, with a type step near 0.4 of it, as Figma draws the
 * initials (12 in 32, 17 in 44); an icon fallback is 1em, so it grows with the circle too. */
export const AVATAR_SIZE = {
  xs: 'size-control-xs text-xs',
  sm: 'size-control-sm text-xs',
  md: 'size-control-md text-base',
  lg: 'size-control-lg text-lg',
  xl: 'size-control-xl text-xl',
  custom: '',
} as const satisfies Record<Size, string>

/** Centred on its own too, so an icon and initials sit the same way. */
export const AVATAR_FALLBACK = 'inline-flex items-center justify-center'

/** Over the fallback, which shows until the image paints. Before the script runs a failed image
 * draws its mark but not its alt; once it has, data-error hides the mark too and keeps the img. */
export const AVATAR_IMAGE = [
  'absolute inset-0 size-full object-cover text-transparent forced-color-adjust-none',
  'data-error:opacity-0',
].join(' ')

/** The root's own box and line, in the fill Figma binds for a placeholder. */
export const AVATAR_SKELETON = [
  'inline-flex shrink-0 items-center justify-center',
  AVATAR_CIRCLE,
  'animate-pulse bg-neutral-soft motion-reduce:animate-none',
  AVATAR_FORCED_EDGE,
].join(' ')
