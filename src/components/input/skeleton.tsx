import { cn } from '#shared/cn.js'
import { INPUT_OWN_WIDTH, INPUT_SIZE, INPUT_SKELETON } from './classes.js'
import { INPUT_DEFAULTS } from './constants.js'
import type { InputSkeletonProps } from './types.js'

/** The box of the text field it stands in for: its height, its type step and its width,
 * so nothing shifts when the field arrives. */
export function InputSkeleton({
  size = INPUT_DEFAULTS.size,
  fullWidth = INPUT_DEFAULTS.fullWidth,
  className,
  ...rest
}: InputSkeletonProps) {
  return (
    <span
      className={cn(
        INPUT_SKELETON,
        // The own width is in em, so it needs the type step of the size, not only its height.
        INPUT_SIZE[size],
        fullWidth ? 'w-full' : INPUT_OWN_WIDTH,
        className,
      )}
      {...rest}
      aria-hidden
    >
      &nbsp;
    </span>
  )
}
