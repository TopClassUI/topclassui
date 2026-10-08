// No 'use client': a client bundle gets it only when a client file imports it.
import { cn } from '#shared/cn.js'
import { truncateLabel } from '#shared/truncate-label.js'
import { BADGE_BOUNDARIES } from './boundaries.js'
import { BADGE_DEFAULTS } from './constants.js'
import type { BadgeProps } from './types.js'
import { badgeVariants } from './variants.js'

/** A status label. No role: the text carries the meaning, so colour never does alone. */
export function Badge({
  variant = BADGE_DEFAULTS.variant,
  tone = BADGE_DEFAULTS.tone,
  size = BADGE_DEFAULTS.size,
  className,
  children,
  ...rest
}: BadgeProps) {
  return (
    <span
      data-variant={variant}
      data-tone={tone}
      data-size={size}
      className={cn(badgeVariants({ variant, tone, size }), className)}
      {...rest}
    >
      {truncateLabel(children, BADGE_BOUNDARIES.labelMaxLength)}
    </span>
  )
}

export { badgeVariants } from './variants.js'
export { BadgeSkeleton } from './skeleton.js'
export type {
  BadgeDesignProps, BadgeProps, BadgeSkeletonProps, BadgeTone, BadgeVariant,
} from './types.js'
