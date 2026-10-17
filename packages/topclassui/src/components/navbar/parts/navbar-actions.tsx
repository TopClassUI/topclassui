import { cn } from '#shared/cn.js'
import { NAVBAR_ACTIONS } from '../classes.js'
import type { NavbarActionsProps } from '../types.js'

/** What sits at the end of the bar: a Button, a search Input, an Avatar. It styles none of
 * them: each brings its own size, ring and target. */
export function NavbarActions({ className, children, ...rest }: NavbarActionsProps) {
  return (
    <div className={cn(NAVBAR_ACTIONS, className)} {...rest}>
      {children}
    </div>
  )
}
