import { cn } from '#shared/cn.js'
import type { ButtonSkeletonProps } from './types.js'

/** The same heights as CONTROL_SIZE, so swapping one for the other shifts nothing. */
const SKELETON_SIZE = {
  xs: 'h-control-xs w-16',
  sm: 'h-control-sm w-20',
  md: 'h-control-md w-24',
  lg: 'h-control-lg w-28',
  xl: 'h-control-xl w-32',
  custom: '',
} as const

export function ButtonSkeleton({ size = 'md', fullWidth = false, className }: ButtonSkeletonProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'block animate-pulse rounded-control bg-surface motion-reduce:animate-none',
        SKELETON_SIZE[size],
        fullWidth && 'w-full',
        className,
      )}
    />
  )
}
