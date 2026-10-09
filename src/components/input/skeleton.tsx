import { cn } from '#shared/cn.js'
import { CONTROL_HEIGHT } from '#shared/classes.js'
import { INPUT_DEFAULTS } from './constants.js'
import type { InputSkeletonProps } from './types.js'

/** The control height at full width, so the field it stands in for shifts nothing. */
export function InputSkeleton({
  size = INPUT_DEFAULTS.size,
  className,
  ...rest
}: InputSkeletonProps) {
  return (
    <span
      className={cn(
        'block w-full animate-pulse rounded-control bg-neutral-soft motion-reduce:animate-none',
        CONTROL_HEIGHT[size],
        className,
      )}
      {...rest}
      aria-hidden
    />
  )
}
