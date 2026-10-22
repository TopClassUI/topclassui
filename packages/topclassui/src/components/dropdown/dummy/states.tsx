'use client'

import type { ReactNode } from 'react'

import { dotsThree } from '#icons/data/dots-three.js'
import { gear } from '#icons/data/gear.js'
import { pencilSimple } from '#icons/data/pencil-simple.js'
import { trash } from '#icons/data/trash.js'
import { user } from '#icons/data/user.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { OVERLAY_SURFACE, ROW } from '#shared/classes.js'
import { cn } from '#shared/cn.js'
import { DropdownItem, DropdownPopup, DropdownRoot, DropdownTrigger } from '../index.js'

// A row of the frame's 58 px: the 76 px menu reaches past it above and below, as drawn.
const CELL = 'flex h-14.5 w-38 items-center justify-center'
// The menu's look, written out from the shared classes: a demo the site shows imports public paths only.
const panel = `flex w-34 flex-col gap-0.5 p-1 ${OVERLAY_SURFACE}`
const row = `${ROW} cursor-default`

interface Row { icon: ReactNode, label: string, highlighted?: boolean, disabled?: boolean }

const EDIT = { icon: <Svg icon={pencilSimple} />, label: 'Edit' }
const DELETE = { icon: <Svg icon={trash} />, label: 'Delete' }

/** One cell, captioned by its title: a picture of the open menu, hidden from a reader and inert, so it draws in every
 * capture of the page, where an open menu hides itself while its trigger is off screen. */
function Menu({ title, rows }: { title: string, rows: Row[] }) {
  return (
    <div title={title} className={CELL}>
      <div aria-hidden inert className={panel}>
        {rows.map(({ icon, label, highlighted = false, disabled = false }) => (
          <div key={label} data-highlighted={highlighted ? '' : undefined} data-disabled={disabled ? '' : undefined}
            className={cn(row, highlighted && 'bg-primary-soft text-primary-on-soft', disabled && '*:opacity-50')}>
            {icon}
            <span className="min-w-0 truncate">{label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Every state, one equal cell each, captioned by its title: the real closed menu behind its trigger, then pictures of
 * the frame's two rows open, Edit under the pointer, and Delete disabled. A submenu and a checked row are not in the API. */
export default function Demo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
      <div title="closed" className={CELL}>
        <DropdownRoot>
          <DropdownTrigger render={<Button variant="outline" size="xs" className="border-line bg-surface"><Svg icon={dotsThree} />Actions</Button>} />
          <DropdownPopup>
            <DropdownItem icon={<Svg icon={user} />}>Profile</DropdownItem>
            <DropdownItem icon={<Svg icon={gear} />}>Settings</DropdownItem>
          </DropdownPopup>
        </DropdownRoot>
      </div>
      <Menu title="open" rows={[EDIT, DELETE]} />
      <Menu title="hover item" rows={[{ ...EDIT, highlighted: true }, DELETE]} />
      <Menu title="disabled item" rows={[EDIT, { ...DELETE, disabled: true }]} />
    </div>
  )
}
