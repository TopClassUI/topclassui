'use client'

import { sidebarSimple } from '#icons/data/sidebar-simple.js'
import { cn } from '#shared/cn.js'
import { Svg } from '#components/svg/index.js'
import { SIDEBAR_ROOT, SIDEBAR_TRIGGER } from './classes.js'
import { SIDEBAR_DEFAULTS } from './constants.js'
import { useSidebarRoot, useSidebarTrigger } from './hook.js'
import type { SidebarRootProps, SidebarTriggerProps } from './types.js'

/** The rail: a nav named by the labels, 220 px expanded and 60 collapsed. It holds the state
 * and writes it as data-open or data-closed, which is all the server parts inside it read. */
export function SidebarRoot({
  open,
  defaultOpen = SIDEBAR_DEFAULTS.defaultOpen,
  onOpenChange,
  'aria-label': name,
  className,
  children,
  ...rest
}: SidebarRootProps) {
  const sidebar = useSidebarRoot(open, defaultOpen, onOpenChange, name)
  return (
    <sidebar.Context value={sidebar.state}>
      <nav
        {...rest}
        aria-label={sidebar.label}
        data-open={sidebar.state.open ? '' : undefined}
        data-closed={sidebar.state.open ? undefined : ''}
        className={cn(SIDEBAR_ROOT, className)}
      >
        {children}
      </nav>
    </sidebar.Context>
  )
}

/** The toggle: a real button that says whether the rail is expanded, and is named by what
 * a press will do. Its icon is directional, so it mirrors with the rail in Arabic. */
export function SidebarTrigger({ onClick, className, ...rest }: SidebarTriggerProps) {
  const trigger = useSidebarTrigger(onClick)
  return (
    <button
      aria-label={trigger.label}
      {...rest}
      type="button"
      aria-expanded={trigger.open}
      onClick={trigger.onClick}
      className={cn(SIDEBAR_TRIGGER, className)}
    >
      <Svg icon={sidebarSimple} />
    </button>
  )
}
