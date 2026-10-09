// R-5.12-4: Avatar's own class strings, one per part. The box is the shared control scale.
import type { Size } from '#shared/contracts/size.js'

/** A circle is a shape, not a radius knob: written once, for the root and its skeleton. */
export const AVATAR_CIRCLE = 'rounded-full'

/** Clipped to the circle, and the positioning context AvatarImage is laid over. */
export const AVATAR_ROOT = [
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden',
  AVATAR_CIRCLE,
  'bg-primary-soft text-primary-on-soft font-medium',
].join(' ')

/** R-5.2-3: the control height on both axes, with the type step CONTROL_SIZE pairs it with. */
export const AVATAR_SIZE = {
  xs: 'size-control-xs text-xs',
  sm: 'size-control-sm text-sm',
  md: 'size-control-md text-sm',
  lg: 'size-control-lg text-base',
  xl: 'size-control-xl text-base',
  custom: '',
} as const satisfies Record<Size, string>

/** Centred on its own too, so an icon and initials sit the same way. */
export const AVATAR_FALLBACK = 'inline-flex items-center justify-center'

/** Over the fallback, which shows until the image paints: no JavaScript is involved. */
export const AVATAR_IMAGE = 'absolute inset-0 size-full object-cover'

/** The root's own box and line, in the fill Figma binds for a placeholder. */
export const AVATAR_SKELETON = [
  'inline-flex shrink-0 items-center justify-center',
  AVATAR_CIRCLE,
  'animate-pulse bg-neutral-soft motion-reduce:animate-none',
].join(' ')
