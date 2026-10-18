'use client'

import { lazy, Suspense, useState, type ReactNode } from 'react'
import { Button } from 'topclassui/button'
import { list } from 'topclassui/icons/list'
import { Svg } from 'topclassui/svg'

const MenuDrawer = lazy(() => import('./menu-drawer'))

export interface MobileMenuProps {
  label: string
  title: string
  navLabel: string
  /** The sidebar's groups, rendered on the server. */
  children: ReactNode
}

/** Under 64rem the sidebar's groups open in a drawer from the inline start (docs-site S2); the drawer loads on first press. */
export function MobileMenu({ label, title, navLabel, children }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const [wanted, setWanted] = useState(false)
  return (
    <>
      <Button
        variant="ghost"
        tone="neutral"
        size="sm"
        className="lg:hidden"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => { setWanted(true); setOpen(true) }}
      >
        <Svg icon={list} />
        <span className="max-md:sr-only">{label}</span>
      </Button>
      {wanted ? (
        <Suspense fallback={null}>
          <MenuDrawer open={open} onOpenChange={setOpen} title={title} navLabel={navLabel}>{children}</MenuDrawer>
        </Suspense>
      ) : null}
    </>
  )
}
