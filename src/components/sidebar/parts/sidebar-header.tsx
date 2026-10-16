import { cn } from '#shared/cn.js'
import { hasContent } from '#shared/render-trigger.js'
import { SIDEBAR_BOUNDARIES } from '../boundaries.js'
import { SIDEBAR_HEADER, SIDEBAR_TITLE } from '../classes.js'
import { SidebarTrigger } from '../client.js'
import { boundLabel, resolveDir } from '../lib.js'
import type { SidebarHeaderProps } from '../types.js'

/** The bar that stays put above the body: the toggle, then the title. Server markup around
 * one client part; the title learns that the rail is collapsed from CSS alone. */
export function SidebarHeader({ className, children, ...rest }: SidebarHeaderProps) {
  return (
    <div className={cn(SIDEBAR_HEADER, className)} {...rest}>
      <SidebarTrigger />
      {hasContent(children)
        ? <span dir={resolveDir(children)} className={SIDEBAR_TITLE}>{boundLabel(children, SIDEBAR_BOUNDARIES.labelMaxLength)}</span>
        : null}
    </div>
  )
}
