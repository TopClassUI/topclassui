import { cn } from '#shared/cn.js'
import { CHECKBOX_SIZE, CHECKBOX_SKELETON, CHECKBOX_SKELETON_BOX } from './classes.js'
import { CHECKBOX_DEFAULTS } from './constants.js'
import type { CheckboxSkeletonProps } from './types.js'

/** The box of the checkbox it stands in for: the target and the square of its size, so nothing shifts when it
 * arrives. A server file with no hook, so a Server Component can render it as a Suspense fallback. */
export function CheckboxSkeleton({ size = CHECKBOX_DEFAULTS.size, className, ...rest }: CheckboxSkeletonProps) {
  return (
    <span className={cn(CHECKBOX_SKELETON, className)} {...rest} aria-hidden>
      <span className={cn(CHECKBOX_SKELETON_BOX, CHECKBOX_SIZE[size])} />
    </span>
  )
}
