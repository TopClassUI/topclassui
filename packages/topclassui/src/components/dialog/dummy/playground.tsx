'use client'

import { useRef } from 'react'

import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle,
  DialogTrigger,
} from '../index.js'
import type { DialogDesignProps } from '../types.js'

const BAR = 'min-h-2 rounded-chip bg-neutral-soft'

/** The page behind the scrim, as the frame draws it: four bars of text, hidden from a reader. */
function PageBehind() {
  return (
    <div aria-hidden className="absolute inset-0 flex flex-col gap-2 p-3.5">
      <div className={`${BAR} w-1/2`} />
      <div className={`${BAR} w-4/5`} />
      <div className={`${BAR} w-2/3`} />
      <div className={`${BAR} w-2/5`} />
    </div>
  )
}

/** The frame's confirm drawn open in a 520 by 280 px box over the page and a scrim: not modal, and it takes no focus. */
function Stage({ size, closeButton }: DialogDesignProps) {
  const root = useRef<HTMLDivElement>(null)
  return (
    <div ref={root} data-stage="" className="relative h-70 w-130 max-w-full overflow-hidden rounded-box [contain:paint]">
      <PageBehind />
      <div aria-hidden className="absolute inset-0 bg-overlay" />
      <DialogRoot defaultOpen modal={false}>
        <DialogPopup size={size} container={root} initialFocus={false}>
          <DialogHeader closeButton={closeButton}>
            <DialogTitle>Delete this project?</DialogTitle>
          </DialogHeader>
          <DialogBody>This removes the project and every file in it. This cannot be undone.</DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="soft" tone="neutral" size="sm">Cancel</Button>} />
            <DialogClose render={<Button tone="danger" size="sm">Delete</Button>} />
          </DialogFooter>
        </DialogPopup>
      </DialogRoot>
    </div>
  )
}

/** The docs stage: the basic dialog, with the schema's props passed through, so the Try it
 * controls drive it. size goes to the popup and closeButton to the header. With stage it is
 * the Stage above; the tree below stays one return, so the docs can write Try it values into it. */
export default function Demo({ size, closeButton, stage = false }: DialogDesignProps & { stage?: boolean } = {}) {
  if (stage) return <Stage size={size} closeButton={closeButton} />
  return (
    <DialogRoot>
      <DialogTrigger render={<Button>Publish</Button>} />
      <DialogPopup size={size}>
        <DialogHeader closeButton={closeButton}>
          <DialogTitle>Publish changes</DialogTitle>
          <DialogDescription>Your changes go live right away.</DialogDescription>
        </DialogHeader>
        <DialogBody>11 files changed since the last publish.</DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="soft" tone="neutral" size="sm">Cancel</Button>} />
          <DialogClose render={<Button size="sm">Publish now</Button>} />
        </DialogFooter>
      </DialogPopup>
    </DialogRoot>
  )
}
