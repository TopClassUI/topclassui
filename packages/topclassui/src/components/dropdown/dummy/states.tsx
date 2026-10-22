'use client'

import { useRef, type ReactNode } from 'react'

import { gear } from '#icons/data/gear.js'
import { pencilSimple } from '#icons/data/pencil-simple.js'
import { trash } from '#icons/data/trash.js'
import { user } from '#icons/data/user.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { DropdownItem, DropdownPopup, DropdownRoot, DropdownTrigger } from '../index.js'

const cell = 'relative flex h-36 w-38 justify-center overflow-hidden pt-2 [contain:paint]'
const trigger = <Button variant="outline" size="sm">Actions</Button>

/** One cell, captioned by its title: the menu under its trigger, drawn open inside the cell, not modal. */
function Open({ title, children }: { title: string, children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  return (
    <div ref={box} title={title} className={cell}>
      <DropdownRoot defaultOpen modal={false}>
        <DropdownTrigger render={trigger} />
        <DropdownPopup container={box}>{children}</DropdownPopup>
      </DropdownRoot>
    </div>
  )
}

/** Every state, one equal cell each, captioned by its title: closed, the frame's two rows open, Edit drawn as the row under
 * the pointer, and Delete disabled. A submenu and a checked row are not in the API, so neither is drawn. */
export default function Demo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
      <div title="closed" className={cell}>
        <DropdownRoot>
          <DropdownTrigger render={trigger} />
          <DropdownPopup>
            <DropdownItem icon={<Svg icon={user} />}>Profile</DropdownItem>
            <DropdownItem icon={<Svg icon={gear} />}>Settings</DropdownItem>
          </DropdownPopup>
        </DropdownRoot>
      </div>
      <Open title="open">
        <DropdownItem icon={<Svg icon={pencilSimple} />}>Edit</DropdownItem>
        <DropdownItem icon={<Svg icon={trash} />}>Delete</DropdownItem>
      </Open>
      <Open title="hover item">
        <DropdownItem icon={<Svg icon={pencilSimple} />} data-highlighted="">Edit</DropdownItem>
        <DropdownItem icon={<Svg icon={trash} />}>Delete</DropdownItem>
      </Open>
      <Open title="disabled item">
        <DropdownItem icon={<Svg icon={pencilSimple} />}>Edit</DropdownItem>
        <DropdownItem icon={<Svg icon={trash} />} disabled>Delete</DropdownItem>
      </Open>
    </div>
  )
}
