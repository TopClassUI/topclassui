import { cn } from '#shared/cn.js'
import { CARD_SKELETON } from './classes.js'
import type { CardSkeletonProps } from './types.js'

/** Holds a card's place while it loads: the full width of its container, at 5:2 until
 * the caller passes the real height in className. */
export function CardSkeleton({ className, ...rest }: CardSkeletonProps) {
  return <div className={cn(CARD_SKELETON, className)} {...rest} aria-hidden />
}
