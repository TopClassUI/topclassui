import { cn } from '#shared/cn.js'
import { CARD_HEADER } from '../classes.js'
import type { CardHeaderProps } from '../types.js'

/** The title row. It sets the type and leaves the heading level to the caller. */
export function CardHeader({ className, children, ...rest }: CardHeaderProps) {
  return (
    <div className={cn(CARD_HEADER, className)} {...rest}>
      {children}
    </div>
  )
}
