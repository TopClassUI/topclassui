import { cn } from '#shared/cn.js'
import { CARD_ROOT } from '../classes.js'
import type { CardRootProps } from '../types.js'

/** The surface. Its radius is the box step, never a control's, so a card never reads
 * as a button. No role: what it holds gives it meaning. */
export function CardRoot({ className, children, ...rest }: CardRootProps) {
  return (
    <div className={cn(CARD_ROOT, className)} {...rest}>
      {children}
    </div>
  )
}
