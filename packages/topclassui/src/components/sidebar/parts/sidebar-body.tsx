import { cn } from '#shared/cn.js'
import { SIDEBAR_BODY } from '../classes.js'
import type { SidebarBodyProps } from '../types.js'

/** The scroll container: a list longer than the rail scrolls here, and the page does not.
 * No tab stop of its own: every row it holds is a link, so the keyboard already reaches it. */
export function SidebarBody({ className, children, ...rest }: SidebarBodyProps) {
  return (
    <div className={cn(SIDEBAR_BODY, className)} {...rest}>
      {children}
    </div>
  )
}
