import { cn } from '#shared/cn.js'
import { CARD_MEDIA } from '../classes.js'
import type { CardMediaProps } from '../types.js'

/** The image band above the title, edge to edge. It goes first inside CardRoot. */
export function CardMedia({ className, children, ...rest }: CardMediaProps) {
  return (
    <div className={cn(CARD_MEDIA, className)} {...rest}>
      {children}
    </div>
  )
}
