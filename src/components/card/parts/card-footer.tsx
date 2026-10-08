import { cn } from '#shared/cn.js'
import { CARD_FOOTER } from '../classes.js'
import type { CardFooterProps } from '../types.js'

/** The action row. Each control inside keeps its own size; the row only spaces them. */
export function CardFooter({ className, children, ...rest }: CardFooterProps) {
  return (
    <div className={cn(CARD_FOOTER, className)} {...rest}>
      {children}
    </div>
  )
}
