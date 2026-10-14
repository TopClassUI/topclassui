'use client'

import { createContext, useContext, useMemo } from 'react'

import { useLabels } from '#shared/provider/context.js'
import { useControllableState } from '#shared/use-controllable-state.js'
import type { SidebarRootProps, SidebarState, SidebarTriggerEvent, SidebarTriggerProps } from './types.js'

/** The state of the nearest SidebarRoot, and null outside one: a trigger with no rail has nothing to toggle. */
export const SidebarContext = createContext(null as SidebarState | null)

/** What SidebarRoot holds: the state, the caller's or its own, and the name of the nav in the
 * language of the provider. An empty aria-label names nothing, so the label stands in for it. */
export function useSidebarRoot(
  open: SidebarRootProps['open'],
  defaultOpen: boolean,
  onOpenChange: SidebarRootProps['onOpenChange'],
  name: string | undefined,
) {
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange })
  const label = useLabels().sidebar.label
  const state = useMemo(() => ({ open: isOpen, setOpen }), [isOpen, setOpen])
  return { state, label: name === undefined || name === '' ? label : name }
}

/** What SidebarTrigger reads: the state of its rail, the name that says what a press will do,
 * and the press itself. A caller's onClick runs first and can stop the toggle by preventing the default. */
export function useSidebarTrigger(onClick: SidebarTriggerProps['onClick']) {
  const state = useContext(SidebarContext)
  if (state === null) throw new Error('SidebarTrigger must be rendered inside a SidebarRoot')
  const labels = useLabels().sidebar
  return {
    open: state.open,
    label: state.open ? labels.collapse : labels.expand,
    onClick: (event: SidebarTriggerEvent) => {
      onClick?.(event)
      if (!event.defaultPrevented) state.setOpen(!state.open)
    },
  }
}
