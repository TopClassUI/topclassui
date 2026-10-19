'use client'

import { useRef } from 'react'

import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle,
  DrawerTrigger,
} from '../index.js'
import type { DrawerDesignProps } from '../types.js'

/** The docs stage: the default sheet, with the schema's props passed to the root, so the Try it
 * controls drive it. size only sets the width of a start or an end sheet. With stage it is drawn
 * open inside its own box over a scrim, as the frame draws it: not modal, and it takes no focus. */
export default function Demo({ placement, size, stage = false }: DrawerDesignProps & { stage?: boolean } = {}) {
  const root = useRef<HTMLDivElement>(null)
  const sheet = (
    <DrawerRoot placement={placement} size={size} defaultOpen={stage} modal={stage ? false : undefined}>
      {stage ? null : <DrawerTrigger render={<Button variant="outline">Filters</Button>} />}
      <DrawerPopup container={stage ? root : undefined} initialFocus={stage ? false : undefined} className={stage ? 'max-h-full' : undefined}>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Narrow the list of projects.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="grid content-start gap-2.5">
          <p>Status</p>
          <p>Owner</p>
          <p>Updated</p>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline">Reset</Button>} />
          <DrawerClose render={<Button>Apply</Button>} />
        </DrawerFooter>
      </DrawerPopup>
    </DrawerRoot>
  )
  if (!stage) return sheet
  return (
    <div ref={root} data-stage="" className="relative min-h-87 w-full [contain:paint]">
      <div aria-hidden className="absolute inset-0 bg-overlay" />
      {sheet}
    </div>
  )
}
