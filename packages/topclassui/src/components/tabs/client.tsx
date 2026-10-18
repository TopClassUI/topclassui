'use client'

import { Tabs as Base } from '@base-ui/react/tabs'

import { CONTROL_SIZE } from '#shared/classes.js'
import { cn } from '#shared/cn.js'
import { renderPart } from '#shared/render-trigger.js'
import { truncateLabel } from '#shared/truncate-label.js'
import { TABS_BOUNDARIES } from './boundaries.js'
import { TABS_LIST, TABS_PANEL, TABS_ROOT, TABS_TAB } from './classes.js'
import { TABS_DEFAULTS } from './constants.js'
import { useTabsLook, useTabsRoot, useTabsTab } from './hook.js'
import type { TabsListProps, TabsPanelProps, TabsRootProps, TabsTabProps } from './types.js'

/** Groups one list of tabs with their panels. Base UI holds which tab is active; the root
 * shares its look with its list and its tabs. */
export function TabsRoot({
  variant = TABS_DEFAULTS.variant,
  size = TABS_DEFAULTS.size,
  className,
  render,
  ...rest
}: TabsRootProps) {
  const root = useTabsRoot(variant, size, rest.value, rest.defaultValue)
  const part = renderPart(render, cn(TABS_ROOT, className))
  return (
    <root.Context value={root.look}>
      <Base.Root data-variant={variant} data-size={size} {...rest} render={part.render} className={part.className} />
    </root.Context>
  )
}

/** Base UI's tablist: the arrow keys, Home and End move the focus along it. */
export function TabsList({ className, render, ...rest }: TabsListProps) {
  const { variant } = useTabsLook()
  const part = renderPart(render, cn(TABS_LIST[variant], className))
  return <Base.List {...rest} render={part.render} className={part.className} />
}

/** Base UI's tab, a button. Its text sits in a span of its own, so a long label ends in an
 * ellipsis. In the server HTML the tab the page opens on is the one tab stop of its list. */
export function TabsTab({ className, render, children, ...rest }: TabsTabProps) {
  const { variant, size, stop } = useTabsTab(rest.value)
  const part = renderPart(render, cn(TABS_TAB[variant], CONTROL_SIZE[size], className))
  return (
    <Base.Tab {...stop} {...rest} render={part.render} className={part.className}>
      {truncateLabel(children, TABS_BOUNDARIES.labelMaxLength)}
    </Base.Tab>
  )
}

/** Base UI's panel. It stays mounted while another tab is active, so a Server Component's
 * markup passed as children is in the HTML whichever tab the page opens on. */
export function TabsPanel({ keepMounted = TABS_DEFAULTS.keepMounted, className, render, ...rest }: TabsPanelProps) {
  const part = renderPart(render, cn(TABS_PANEL, className))
  return <Base.Panel {...rest} keepMounted={keepMounted} render={part.render} className={part.className} />
}
