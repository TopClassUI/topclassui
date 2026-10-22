'use client'

import { useRef } from 'react'

import { copy } from '#icons/data/copy.js'
import { dotsThree } from '#icons/data/dots-three.js'
import { gear } from '#icons/data/gear.js'
import { trash } from '#icons/data/trash.js'
import { user } from '#icons/data/user.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { DropdownItem, DropdownPopup, DropdownRoot, DropdownSeparator, DropdownTrigger } from '../index.js'
import type { DropdownDesignProps } from '../types.js'

/** The menu drawn open under its trigger, the two centred as one 220 px group with Delete in danger, as the frame draws
 * it: not modal. Base UI gives a menu no initialFocus, so on open the focus moves to it. */
function Stage({ placement, delay, closeDelay }: DropdownDesignProps) {
  const root = useRef<HTMLDivElement>(null)
  return (
    <div ref={root} data-stage="" className="relative grid min-h-67.75 w-full place-content-center justify-items-center [contain:paint]">
      <div className="h-47 w-55">
        <DropdownRoot defaultOpen modal={false}>
          <DropdownTrigger
            openOnHover
            delay={delay}
            closeDelay={closeDelay}
            render={
              <Button variant="outline" size="xs" className="border-line bg-surface">
                <Svg icon={dotsThree} />
                Actions
              </Button>
            }
          />
          <DropdownPopup placement={placement} container={root}>
            <DropdownItem icon={<Svg icon={user} />} shortcut="Ctrl P">Profile</DropdownItem>
            <DropdownItem icon={<Svg icon={gear} />} data-highlighted="">Settings</DropdownItem>
            <DropdownItem icon={<Svg icon={copy} />}>Duplicate</DropdownItem>
            <DropdownSeparator />
            <DropdownItem icon={<Svg icon={trash} />} shortcut="Del" tone="danger">Delete</DropdownItem>
          </DropdownPopup>
        </DropdownRoot>
      </div>
    </div>
  )
}

/** The docs stage: the basic menu, with the schema's props passed through, so the Try it controls drive it. Delete is
 * danger, as drawn; the delays only apply with openOnHover. With stage it is the Stage above; the tree below stays one
 * return, so the docs can write Try it values into it. */
export default function Demo({ placement, delay, closeDelay, stage = false }: DropdownDesignProps & { stage?: boolean } = {}) {
  if (stage) return <Stage placement={placement} delay={delay} closeDelay={closeDelay} />
  return (
    <DropdownRoot>
      <DropdownTrigger
        openOnHover
        delay={delay}
        closeDelay={closeDelay}
        render={
          <Button variant="outline" size="xs" className="border-line bg-surface">
            <Svg icon={dotsThree} />
            Actions
          </Button>
        }
      />
      <DropdownPopup placement={placement}>
        <DropdownItem icon={<Svg icon={user} />} shortcut="Ctrl P">Profile</DropdownItem>
        <DropdownItem icon={<Svg icon={gear} />}>Settings</DropdownItem>
        <DropdownItem icon={<Svg icon={copy} />}>Duplicate</DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={<Svg icon={trash} />} shortcut="Del" tone="danger">Delete</DropdownItem>
      </DropdownPopup>
    </DropdownRoot>
  )
}
