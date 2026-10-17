// Loaded into a live page by e2e/overlay-layers.spec.ts: every overlay of Unit 3 opened from inside another, so a test
// can press each pair and ask which one the pointer reaches. A page-level Command opens on Ctrl+K over whatever is open.
import { useState, type CSSProperties, type ReactNode } from 'react'
import { createRoot } from 'react-dom/client'

import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { Command } from '#components/command/index.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '#components/dialog/index.js'
import { DrawerBody, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger } from '#components/drawer/index.js'
import type { DrawerRootProps } from '#components/drawer/index.js'
import { DropdownItem, DropdownPopup, DropdownRoot, DropdownTrigger } from '#components/dropdown/index.js'
import { PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '#components/popover/index.js'
import { toast } from '#components/toast/index.js'

const ROW: CSSProperties = { display: 'flex', flexWrap: 'wrap', gap: 12, padding: 24 }
const ACTIONS = ['Rename', 'Duplicate', 'Archive'].map((label) => ({ id: label.toLowerCase(), label }))

function InnerDialog({ name }: { name: string }): ReactNode {
  return (
    <DialogRoot>
      <DialogTrigger render={<Button variant="outline" size="sm">{name}</Button>} />
      <DialogPopup size="sm">
        <DialogHeader><DialogTitle>{name}</DialogTitle></DialogHeader>
        <DialogBody>The name shows in every link.</DialogBody>
        <DialogFooter><DialogClose render={<Button size="sm">Done</Button>} /></DialogFooter>
      </DialogPopup>
    </DialogRoot>
  )
}

function InnerSheet({ name, placement }: { name: string, placement?: DrawerRootProps['placement'] }): ReactNode {
  return (
    <DrawerRoot placement={placement}>
      <DrawerTrigger render={<Button variant="outline" size="sm">{name}</Button>} />
      <DrawerPopup>
        <DrawerHeader><DrawerTitle>{name}</DrawerTitle></DrawerHeader>
        <DrawerBody><Button size="sm">Share</Button></DrawerBody>
      </DrawerPopup>
    </DrawerRoot>
  )
}

function InnerPopover({ name }: { name: string }): ReactNode {
  return (
    <PopoverRoot>
      <PopoverTrigger render={<Button variant="outline" size="sm">{name}</Button>} />
      <PopoverPopup>
        <PopoverTitle>{name}</PopoverTitle>
        <Button size="sm">Apply</Button>
      </PopoverPopup>
    </PopoverRoot>
  )
}

function InnerMenu({ name }: { name: string }): ReactNode {
  return (
    <DropdownRoot>
      <DropdownTrigger render={<Button variant="outline" size="sm">{name}</Button>} />
      <DropdownPopup aria-label={name}>
        <DropdownItem>Viewer</DropdownItem>
        <DropdownItem>Editor</DropdownItem>
      </DropdownPopup>
    </DropdownRoot>
  )
}

function CommandFromPopover(): ReactNode {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => { setOpen(true) }}>Command from popover</Button>
      <Command
        items={ACTIONS}
        getKey={(action) => action.id}
        getLabel={(action) => action.label}
        onSelect={() => undefined}
        shortcut={null}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  )
}

function DialogFromMenu(): ReactNode {
  const [open, setOpen] = useState(false)
  return (
    <>
      <DropdownItem closeOnClick={false} onClick={() => { setOpen(true) }}>Dialog from menu</DropdownItem>
      <DialogRoot open={open} onOpenChange={setOpen}>
        <DialogPopup size="sm">
          <DialogHeader><DialogTitle>Dialog from menu</DialogTitle></DialogHeader>
          <DialogFooter><DialogClose render={<Button size="sm">Done</Button>} /></DialogFooter>
        </DialogPopup>
      </DialogRoot>
    </>
  )
}

function Fixture(): ReactNode {
  const direction = document.documentElement.dir === 'rtl' ? 'rtl' : 'ltr'
  return (
    <TopClassProvider direction={direction} locale="en">
      <div id="layers" style={ROW}>
        <DialogRoot>
          <DialogTrigger render={<Button variant="outline">Dialog</Button>} />
          <DialogPopup>
            <DialogHeader><DialogTitle>Dialog</DialogTitle></DialogHeader>
            <DialogBody>
              <div style={ROW}>
                <InnerSheet name="Sheet from dialog" />
                <InnerPopover name="Popover from dialog" />
                <InnerMenu name="Menu from dialog" />
              </div>
            </DialogBody>
          </DialogPopup>
        </DialogRoot>

        <DrawerRoot>
          <DrawerTrigger render={<Button variant="outline">Sheet</Button>} />
          <DrawerPopup>
            <DrawerHeader><DrawerTitle>Sheet</DrawerTitle></DrawerHeader>
            <DrawerBody>
              <div style={ROW}>
                <InnerDialog name="Dialog from sheet" />
                <InnerPopover name="Popover from sheet" />
                <InnerMenu name="Menu from sheet" />
                <Button variant="outline" size="sm" onClick={() => { toast.add({ title: 'Saved from the sheet', duration: 0 }) }}>
                  Toast from sheet
                </Button>
              </div>
            </DrawerBody>
          </DrawerPopup>
        </DrawerRoot>

        <PopoverRoot>
          <PopoverTrigger render={<Button variant="outline">Popover</Button>} />
          <PopoverPopup>
            <PopoverTitle>Popover</PopoverTitle>
            <InnerDialog name="Dialog from popover" />
            <InnerSheet name="Sheet from popover" placement="start" />
            <CommandFromPopover />
          </PopoverPopup>
        </PopoverRoot>

        <DropdownRoot>
          <DropdownTrigger render={<Button variant="outline">Menu</Button>} />
          <DropdownPopup aria-label="Menu">
            <DialogFromMenu />
          </DropdownPopup>
        </DropdownRoot>

        <Command items={ACTIONS} getKey={(action) => action.id} getLabel={(action) => action.label} onSelect={() => undefined} />
      </div>
    </TopClassProvider>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
