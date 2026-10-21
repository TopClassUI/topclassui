'use client'

import { useRef } from 'react'

import { copy } from '#icons/data/copy.js'
import { gear } from '#icons/data/gear.js'
import { trash } from '#icons/data/trash.js'
import { user } from '#icons/data/user.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { DropdownItem, DropdownPopup, DropdownRoot, DropdownSeparator, DropdownTrigger } from '../index.js'
import type { DropdownDesignProps } from '../types.js'

/** The menu drawn open under its trigger inside its own box, as the frame draws it: not modal. Base UI gives a menu
 * no initialFocus, so on open the focus moves to it. */
function Stage({ placement, tone, delay, closeDelay }: DropdownDesignProps) {
  const root = useRef<HTMLDivElement>(null)
  return (
    <div ref={root} data-stage="" className="relative min-h-87 w-full [contain:paint]">
      <div className="flex justify-center p-6">
        <DropdownRoot defaultOpen modal={false}>
          <DropdownTrigger openOnHover delay={delay} closeDelay={closeDelay} render={<Button variant="outline">Actions</Button>} />
          <DropdownPopup placement={placement} container={root}>
            <DropdownItem icon={<Svg icon={user} />} shortcut="Ctrl P">Profile</DropdownItem>
            <DropdownItem icon={<Svg icon={gear} />}>Settings</DropdownItem>
            <DropdownItem icon={<Svg icon={copy} />}>Duplicate</DropdownItem>
            <DropdownSeparator />
            <DropdownItem icon={<Svg icon={trash} />} tone={tone}>Delete</DropdownItem>
          </DropdownPopup>
        </DropdownRoot>
      </div>
    </div>
  )
}

/** The docs stage: the basic menu, with the schema's props passed through, so the Try it controls drive it. tone colours
 * the last row; the delays only apply with openOnHover. With stage it is the Stage above; the tree below stays one
 * return, so the docs can write Try it values into it. */
export default function Demo({ placement, tone, delay, closeDelay, stage = false }: DropdownDesignProps & { stage?: boolean } = {}) {
  if (stage) return <Stage placement={placement} tone={tone} delay={delay} closeDelay={closeDelay} />
  return (
    <DropdownRoot>
      <DropdownTrigger openOnHover delay={delay} closeDelay={closeDelay} render={<Button variant="outline">Actions</Button>} />
      <DropdownPopup placement={placement}>
        <DropdownItem icon={<Svg icon={user} />} shortcut="Ctrl P">Profile</DropdownItem>
        <DropdownItem icon={<Svg icon={gear} />}>Settings</DropdownItem>
        <DropdownItem icon={<Svg icon={copy} />}>Duplicate</DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={<Svg icon={trash} />} tone={tone}>Delete</DropdownItem>
      </DropdownPopup>
    </DropdownRoot>
  )
}
