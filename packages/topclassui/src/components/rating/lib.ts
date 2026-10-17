// Both halves draw their stars here: no 'use client', so the read-only half stays on the server.
import { Svg } from '#components/svg/index.js'
import { star } from '#icons/data/star.js'
import { starFill } from '#icons/data/star-fill.js'
import { clamp } from '#shared/clamp.js'
import { cn } from '#shared/cn.js'
import type { Size } from '#shared/contracts/size.js'
import { RATING_BOUNDARIES } from './boundaries.js'
import { RATING_FILL, RATING_FILL_ICON, RATING_FILL_WIDTH, RATING_STAR } from './classes.js'
import type { RatingFill } from './types.js'

/** R-5.7-7: a whole number of stars, from 1 to 10. */
export function toMax(max: number): number {
  return Math.round(clamp(max, RATING_BOUNDARIES.maxMin, RATING_BOUNDARIES.maxMax))
}

/** What a read-only rating draws and says: clamped to 0 and max, then to the nearest half. */
export function toShown(value: number, max: number): number {
  return Math.round(clamp(value, 0, max) * 2) / 2
}

/** What an editing rating checks: clamped to 0 and max, then to a whole step. 0 checks none. */
export function toStep(value: number, max: number): number {
  return Math.round(clamp(value, 0, max))
}

/** The steps, 1 to max. */
export function stepsOf(max: number): number[] {
  return Array.from({ length: max }, (_, index) => index + 1)
}

/** The fill rule: a star is full at or below the value, half within half a star of it. */
export function fillOf(step: number, value: number): RatingFill {
  if (value >= step) return 'full'
  return value >= step - 0.5 ? 'half' : 'none'
}

/** custom follows the font size, as an icon with no size does. */
export const iconSizeOf = (size: Size) => (size === 'custom' ? '1em' : size)

/** One star: the outline, and over it the filled icon in a clip as wide as the fill. */
export function Star({ fill, size }: { fill: RatingFill; size: Size }) {
  return (
    <span className={RATING_STAR}>
      <Svg icon={star} size={iconSizeOf(size)} />
      {fill === 'none' ? null : (
        <span aria-hidden className={cn(RATING_FILL, RATING_FILL_WIDTH[fill])}>
          <Svg icon={starFill} size={iconSizeOf(size)} className={RATING_FILL_ICON} />
        </span>
      )}
    </span>
  )
}
