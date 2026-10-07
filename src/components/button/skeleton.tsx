import { cn } from '#shared/cn.js'
import { CONTROL_HEIGHT } from '#shared/classes.js'
import { SKELETON_WIDTH } from './classes.js'
import { BUTTON_DEFAULTS } from './constants.js'
import type { ButtonSkeletonProps } from './types.js'

export function ButtonSkeleton({
  size = BUTTON_DEFAULTS.size,
  fullWidth = BUTTON_DEFAULTS.fullWidth,
  className,
  ...rest
}: ButtonSkeletonProps) {
  return (
    <span
      className={cn(
        'block animate-pulse rounded-control bg-surface motion-reduce:animate-none',
        CONTROL_HEIGHT[size],
        SKELETON_WIDTH[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
      aria-hidden
    />
  )
}
