'use client'

import { useState } from 'react'

import { Button } from '#components/button/index.js'
import { PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index.js'

const CELL = 'relative flex h-28 justify-center overflow-hidden [contain:paint]'
const PANEL = 'w-28 p-2.5'
const LABEL = 'font-mono text-xs/tight font-normal text-muted'

/** Every state the frame draws, one equal cell each, captioned by its title: the closed trigger, then a small popup
 * drawn open below its trigger, and one with no room below in its cell that flipped above it. */
export default function Demo() {
  // Elements, not refs: a popup open on the first render resolves its container before a ref is attached.
  const [open, setOpen] = useState<HTMLDivElement | null>(null)
  const [flipped, setFlipped] = useState<HTMLDivElement | null>(null)
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
      <div title="closed" className="flex h-28 items-center justify-center">
        <PopoverRoot>
          <PopoverTrigger render={<Button variant="outline">Share</Button>} />
          <PopoverPopup>
            <PopoverTitle>Share this page</PopoverTitle>
            <PopoverDescription>Its trigger opened it; Escape or a press outside closes it.</PopoverDescription>
          </PopoverPopup>
        </PopoverRoot>
      </div>
      <div ref={setOpen} title="open" className={`${CELL} items-start pt-2`}>
        <PopoverRoot defaultOpen>
          <PopoverTrigger render={<Button variant="outline">Details</Button>} />
          <PopoverPopup container={open} initialFocus={false} className={PANEL}>
            <PopoverTitle className={LABEL}>Details</PopoverTitle>
          </PopoverPopup>
        </PopoverRoot>
      </div>
      <div ref={setFlipped} title="flipped" className={`${CELL} items-end pb-2`}>
        <PopoverRoot defaultOpen>
          <PopoverTrigger render={<Button variant="outline">Settings</Button>} />
          <PopoverPopup container={flipped} initialFocus={false} className={PANEL}>
            <PopoverTitle className={LABEL}>Settings</PopoverTitle>
          </PopoverPopup>
        </PopoverRoot>
      </div>
    </div>
  )
}
