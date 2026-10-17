import { cn } from '#shared/cn.js'
import {
  OTP_CELL_FIT, OTP_CELL_SIZE, OTP_CELL_WHOLE, OTP_ROOT, OTP_SEPARATOR, OTP_SKELETON_CELL, OTP_SKELETON_CELL_WIDTH,
  OTP_SKELETON_SEPARATOR,
} from './classes.js'
import { OTP_FIELD_DEFAULTS } from './constants.js'
import { clampLength, layoutCells } from './lib.js'
import type { OTPFieldSkeletonProps } from './types.js'

/** The box of the code field it stands in for: one cell per clamped `length` at its size, the gaps, the separators
 * and the same wrap, so nothing shifts when it arrives. A server file, so it can be a Suspense fallback. */
export function OTPFieldSkeleton({
  length = OTP_FIELD_DEFAULTS.length,
  groupSize = OTP_FIELD_DEFAULTS.groupSize,
  size = OTP_FIELD_DEFAULTS.size,
  className,
  ...rest
}: OTPFieldSkeletonProps) {
  const { separators, whole } = layoutCells(clampLength(length), groupSize)
  const cell = cn(OTP_SKELETON_CELL, whole ? OTP_CELL_WHOLE : OTP_CELL_FIT, OTP_CELL_SIZE[size], OTP_SKELETON_CELL_WIDTH)
  return (
    <span className={cn(OTP_ROOT, className)} {...rest} aria-hidden>
      {separators.flatMap((separator, index) => {
        const box = <span key={`cell-${String(index)}`} className={cell} />
        return separator ? [box, <span key={`separator-${String(index)}`} className={cn(OTP_SEPARATOR, OTP_SKELETON_SEPARATOR)} />] : [box]
      })}
    </span>
  )
}
