// Both halves draw their stars here: no 'use client', so the read-only half stays on the server.
import { Svg } from '#components/svg/index.js'
import { star } from '#icons/data/star.js'
import { starFill } from '#icons/data/star-fill.js'
import { cn } from '#shared/cn.js'
import { RATING_FILL, RATING_FILL_ICON, RATING_FILL_WIDTH, RATING_STAR } from '../classes.js'
import { iconSizeOf } from '../lib.js'
import type { RatingStarProps } from '../types.js'

/** One star: the outline, and over it the filled icon in a clip as wide as the fill. */
export function RatingStar({ fill, size }: RatingStarProps) {
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
