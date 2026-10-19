'use client'

import { useRef, type ReactNode } from 'react'

import { copy } from '#icons/data/copy.js'
import { gear } from '#icons/data/gear.js'
import { pencilSimple } from '#icons/data/pencil-simple.js'
import { trash } from '#icons/data/trash.js'
import { user } from '#icons/data/user.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { DropdownItem, DropdownPopup, DropdownRoot, DropdownSeparator, DropdownTrigger } from '../index.js'

const cell = 'relative h-64 w-64 overflow-hidden rounded-box border-(length:--tc-line-width) border-line p-3 [contain:paint]'

/** One cell, captioned by its title: the menu under its trigger, drawn open inside the cell, not modal. */
function Open({ title, children }: { title: string, children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  return (
    <div ref={box} title={title} className={cell}>
      <DropdownRoot defaultOpen modal={false}>
        <DropdownTrigger render={<Button variant="outline">Actions</Button>} />
        <DropdownPopup container={box}>{children}</DropdownPopup>
      </DropdownRoot>
    </div>
  )
}

/** Every state, one cell each, captioned by its title: closed, open and a disabled row. The hover of a row needs a live
 * pointer, and a submenu and a checked row are not in the API, so none is drawn. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <div title="closed" className={cell}>
        <DropdownRoot>
          <DropdownTrigger render={<Button variant="outline">Actions</Button>} />
          <DropdownPopup>
            <DropdownItem icon={<Svg icon={user} />}>Profile</DropdownItem>
            <DropdownItem icon={<Svg icon={gear} />}>Settings</DropdownItem>
          </DropdownPopup>
        </DropdownRoot>
      </div>
      <Open title="open">
        <DropdownItem icon={<Svg icon={user} />} shortcut="Ctrl P">Profile</DropdownItem>
        <DropdownItem icon={<Svg icon={gear} />}>Settings</DropdownItem>
        <DropdownItem icon={<Svg icon={copy} />}>Duplicate</DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={<Svg icon={trash} />} tone="danger">Delete</DropdownItem>
      </Open>
      <Open title="disabled item">
        <DropdownItem icon={<Svg icon={copy} />}>Duplicate</DropdownItem>
        <DropdownItem icon={<Svg icon={pencilSimple} />} disabled>Rename</DropdownItem>
      </Open>
    </div>
  )
}
