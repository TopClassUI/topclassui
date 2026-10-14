'use client'

import { useState } from 'react'

import { folder } from '#icons/data/folder.js'
import { house } from '#icons/data/house.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { SidebarBody, SidebarGroup, SidebarHeader, SidebarLink, SidebarRoot } from '../index.js'

/** open and onOpenChange need a client file: a Server Component page cannot pass a function.
 * Here the page holds the state, so a button outside the rail toggles it as its own does. */
export default function Demo() {
  const [open, setOpen] = useState(true)
  const [changes, setChanges] = useState(0)
  return (
    <div className="flex h-96 gap-4">
      <SidebarRoot open={open} onOpenChange={(next) => { setOpen(next); setChanges((count) => count + 1) }}>
        <SidebarHeader>Workspace</SidebarHeader>
        <SidebarBody>
          <SidebarGroup>
            <SidebarLink href="#home" icon={<Svg icon={house} />} current>Home</SidebarLink>
            <SidebarLink href="#projects" icon={<Svg icon={folder} />}>Projects</SidebarLink>
          </SidebarGroup>
        </SidebarBody>
      </SidebarRoot>
      <div className="grid min-w-0 flex-1 content-start gap-3">
        <Button variant="outline" className="justify-self-start" onClick={() => { setOpen((current) => !current) }}>
          {open ? 'Hide the labels' : 'Show the labels'}
        </Button>
        <p className="text-sm text-muted">The rail asked to change {changes} times.</p>
      </div>
    </div>
  )
}
