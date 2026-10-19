'use client'

import { useState } from 'react'

import { Button } from '#components/button/index.js'
import { PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index.js'

const CELL = 'relative flex h-52 w-80 justify-center overflow-hidden rounded-box border-(length:--tc-line-width) border-line [contain:paint]'

/** Every state the frame draws, one cell each, captioned by its title: the closed trigger, then a popup
 * drawn open below its trigger, and one with no room below in its cell that flipped above it. */
export default function Demo() {
  // Elements, not refs: a popup open on the first render resolves its container before a ref is attached.
  const [open, setOpen] = useState<HTMLDivElement | null>(null)
  const [flipped, setFlipped] = useState<HTMLDivElement | null>(null)
  return (
    <div className="flex flex-wrap items-start gap-4">
      <div title="closed" className="flex h-52 w-80 items-center justify-center">
        <PopoverRoot>
          <PopoverTrigger render={<Button variant="outline">Share</Button>} />
          <PopoverPopup>
            <PopoverTitle>Share this page</PopoverTitle>
            <PopoverDescription>Its trigger opened it; Escape or a press outside closes it.</PopoverDescription>
          </PopoverPopup>
        </PopoverRoot>
      </div>
      <div ref={setOpen} title="open" className={`${CELL} items-start pt-3`}>
        <PopoverRoot defaultOpen>
          <PopoverTrigger render={<Button variant="outline">Details</Button>} />
          <PopoverPopup container={open} initialFocus={false}>
            <PopoverTitle>Details</PopoverTitle>
            <PopoverDescription>Below its trigger, where it opens by default.</PopoverDescription>
          </PopoverPopup>
        </PopoverRoot>
      </div>
      <div ref={setFlipped} title="flipped" className={`${CELL} items-end pb-3`}>
        <PopoverRoot defaultOpen>
          <PopoverTrigger render={<Button variant="outline">Settings</Button>} />
          <PopoverPopup container={flipped} initialFocus={false}>
            <PopoverTitle>Settings</PopoverTitle>
            <PopoverDescription>No room below it in its cell, so it flipped above its trigger.</PopoverDescription>
          </PopoverPopup>
        </PopoverRoot>
      </div>
    </div>
  )
}
