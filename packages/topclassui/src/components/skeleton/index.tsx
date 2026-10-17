// No 'use client': a client bundle gets it only when a client file imports it.
import { cn } from '#shared/cn.js'
import { clamp } from '#shared/clamp.js'
import { SKELETON_BOUNDARIES } from './boundaries.js'
import { SKELETON_FILL, SKELETON_LAST_ROW, SKELETON_ROW, SKELETON_SHAPE } from './classes.js'
import { SKELETON_DEFAULTS } from './constants.js'
import type { SkeletonProps } from './types.js'

/** Holds the shape of content while it loads. Hidden from assistive technology, so the
 * region that is loading speaks for itself; the real size comes from className. */
export function Skeleton({
  variant = SKELETON_DEFAULTS.variant,
  rows = SKELETON_DEFAULTS.rows,
  className,
  ...rest
}: SkeletonProps) {
  if (variant !== 'text') {
    return (
      <span
        data-variant={variant}
        className={cn(SKELETON_SHAPE[variant], SKELETON_FILL, className)}
        {...rest}
        aria-hidden
      />
    )
  }

  // R-5.7-7; trunc too, or rows={2.5} draws two rows and narrows neither.
  const count = Math.trunc(clamp(rows, SKELETON_BOUNDARIES.rowsMin, SKELETON_BOUNDARIES.rowsMax))

  return (
    <span data-variant={variant} className={cn(SKELETON_SHAPE.text, className)} {...rest} aria-hidden>
      {Array.from({ length: count }, (_, row) => (
        <span
          key={row}
          className={cn(SKELETON_ROW, SKELETON_FILL, count > 1 && row === count - 1 && SKELETON_LAST_ROW)}
        />
      ))}
    </span>
  )
}

export type { SkeletonDesignProps, SkeletonProps, SkeletonVariant } from './types.js'
