import { cn } from '#shared/cn.js'
import { renderElement } from '#shared/render.js'
import { CARD_INTERACTIVE, CARD_ROOT } from '../classes.js'
import type { CardRootProps } from '../types.js'

/** The surface. Its radius is the box step, never a control's, so a card never reads
 * as a button. No role: what it holds gives it meaning, or the element render gives. */
export function CardRoot({ className, children, render, ...rest }: CardRootProps) {
  if (render) {
    return renderElement(render, {
      className: cn(CARD_ROOT, CARD_INTERACTIVE, className),
      children,
      ...rest,
    })
  }
  return (
    <div className={cn(CARD_ROOT, className)} {...rest}>
      {children}
    </div>
  )
}
