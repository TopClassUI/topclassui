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

/** The docs stage: the basic menu, with the schema's props passed through, so the Try it controls drive it. tone colours
 * the last row; the delays only apply with openOnHover. With stage it is drawn open under its trigger inside its own box,
 * as the frame draws it: not modal. Base UI gives a menu no initialFocus, so on open the focus moves to it. */
export default function Demo({ placement, tone, delay, closeDelay, stage = false }: DropdownDesignProps & { stage?: boolean } = {}) {
  const root = useRef<HTMLDivElement>(null)
  const trigger = <DropdownTrigger openOnHover delay={delay} closeDelay={closeDelay} render={<Button variant="outline">Actions</Button>} />
  const rows = (
    <>
      <DropdownItem icon={<Svg icon={user} />} shortcut="Ctrl P">Profile</DropdownItem>
      <DropdownItem icon={<Svg icon={gear} />}>Settings</DropdownItem>
      <DropdownItem icon={<Svg icon={copy} />}>Duplicate</DropdownItem>
      <DropdownSeparator />
      <DropdownItem icon={<Svg icon={trash} />} shortcut="Del" tone={tone}>Delete</DropdownItem>
    </>
  )
  if (stage) {
    return (
      <div ref={root} data-stage="" className="relative min-h-87 w-full [contain:paint]">
        <div className="flex justify-center p-6">
          <DropdownRoot defaultOpen modal={false}>
            {trigger}
            <DropdownPopup placement={placement} container={root}>{rows}</DropdownPopup>
          </DropdownRoot>
        </div>
      </div>
    )
  }
  return (
    <DropdownRoot>
      {trigger}
      <DropdownPopup placement={placement}>{rows}</DropdownPopup>
    </DropdownRoot>
  )
}
