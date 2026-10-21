'use client'

import { useRef } from 'react'

import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle,
  DialogTrigger,
} from '../index.js'
import type { DialogDesignProps } from '../types.js'

const BAR = 'min-h-2 rounded-chip bg-surface-raised'

/** The page behind the scrim, as the frame draws it: four bars of text, hidden from a reader. */
function PageBehind() {
  return (
    <div aria-hidden className="absolute inset-0 flex flex-col gap-2 p-6">
      <div className={`${BAR} w-1/2`} />
      <div className={`${BAR} w-4/5`} />
      <div className={`${BAR} w-2/3`} />
      <div className={`${BAR} w-2/5`} />
    </div>
  )
}

/** The docs stage: the basic dialog, with the schema's props passed through, so the Try it
 * controls drive it. size goes to the popup and closeButton to the header. With stage it is
 * drawn open inside its own box over the page and a scrim, as the frame draws it: not modal, and it takes no focus. */
export default function Demo({ size, closeButton, stage = false }: DialogDesignProps & { stage?: boolean } = {}) {
  const root = useRef<HTMLDivElement>(null)
  const content = (
    <>
      <DialogHeader closeButton={closeButton}>
        <DialogTitle>Publish changes</DialogTitle>
        <DialogDescription>Your changes go live right away.</DialogDescription>
      </DialogHeader>
      <DialogBody>11 files changed since the last publish.</DialogBody>
      <DialogFooter>
        <DialogClose render={<Button variant="soft" tone="neutral" size="sm">Cancel</Button>} />
        <DialogClose render={<Button size="sm">Publish now</Button>} />
      </DialogFooter>
    </>
  )
  if (stage) {
    return (
      <div ref={root} data-stage="" className="relative min-h-87 w-full [contain:paint]">
        <PageBehind />
        <div aria-hidden className="absolute inset-0 bg-overlay" />
        <DialogRoot defaultOpen modal={false}>
          <DialogPopup size={size} container={root} initialFocus={false}>{content}</DialogPopup>
        </DialogRoot>
      </div>
    )
  }
  return (
    <DialogRoot>
      <DialogTrigger render={<Button>Publish</Button>} />
      <DialogPopup size={size}>{content}</DialogPopup>
    </DialogRoot>
  )
}
