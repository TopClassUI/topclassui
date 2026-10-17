import { cn } from '#shared/cn.js'
import { CARD_BODY } from '../classes.js'
import type { CardBodyProps } from '../types.js'

/** The text, in muted type. A block, so inline content flows as one paragraph. */
export function CardBody({ className, children, ...rest }: CardBodyProps) {
  return (
    <div className={cn(CARD_BODY, className)} {...rest}>
      {children}
    </div>
  )
}
