'use client'

import { useRender } from '@base-ui/react/use-render'
import { createContext, useContext, useId, useLayoutEffect, useMemo, useState } from 'react'

import { usePortalLocale } from '#shared/provider/use-portal-locale.js'
import type { TooltipPopupId, TooltipTriggerElementProps } from './types.js'

const noPopup: TooltipPopupId = { popupId: undefined, setOwnId: () => undefined }
/** The popup id of the nearest TooltipRoot, which its trigger names while open, and the popup's way to
 * hand over an id of the caller's. */
export const TooltipPopupIdContext = createContext(noPopup)

/** One popup id per root, so two tooltips never describe each other's trigger; a caller's id wins. */
export function useTooltipRoot() {
  const generated = useId()
  const [ownId, setOwnId] = useState(undefined as string | undefined)
  return useMemo(() => ({ popupId: ownId ?? generated, setOwnId }), [ownId, generated])
}

/** The trigger's render, given Base UI's props plus an aria-describedby naming the popup while it is
 * open. An element, or a button with none, is merged by useRender as Base UI merges its own. */
export function useTooltipTriggerElement({ render, props, state }: TooltipTriggerElementProps) {
  const { popupId } = useContext(TooltipPopupIdContext)
  const described = { ...props, 'aria-describedby': state.open ? popupId : undefined }
  const called = typeof render === 'function'
  const element = useRender({ render: called ? undefined : render, props: described, defaultTagName: 'button', enabled: !called })
  return called ? render(described, state) : element
}

/** What TooltipPopup reads: its id, which it hands its root when the caller gave one, and the dir and
 * the lang its positioner carries, since a portal inherits neither from an island. With no provider
 * the page's own apply. */
export function useTooltipPopup(ownId: string | undefined) {
  const { popupId, setOwnId } = useContext(TooltipPopupIdContext)
  useLayoutEffect(() => {
    setOwnId(ownId)
    return () => { setOwnId(undefined) }
  }, [ownId, setOwnId])
  return { ...usePortalLocale(), id: ownId ?? popupId }
}
