'use client'

import type { MouseEvent, ReactNode } from 'react'
import { DrawerBody, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle } from 'topclassui/drawer'

export interface MenuDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  navLabel: string
  children: ReactNode
  footer?: ReactNode
}

/** The drawer itself, loaded on the menu's first press so no page pays for it up front. */
export default function MenuDrawer({ open, onOpenChange, title, navLabel, children, footer }: MenuDrawerProps) {
  // A link inside keeps the layout mounted, so the drawer closes itself once one is followed.
  const closeOnLink = (event: MouseEvent) => {
    if (event.target instanceof Element && event.target.closest('a') !== null) onOpenChange(false)
  }
  return (
    <DrawerRoot placement="start" size="sm" open={open} onOpenChange={onOpenChange}>
      <DrawerPopup>
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <DrawerBody>
          <nav aria-label={navLabel} onClick={closeOnLink}>{children}</nav>
        </DrawerBody>
        {footer === undefined ? null : (
          <DrawerFooter className="flex-wrap justify-between sm:hidden" onClick={closeOnLink}>{footer}</DrawerFooter>
        )}
      </DrawerPopup>
    </DrawerRoot>
  )
}
