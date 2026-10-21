'use client'

import { useRef } from 'react'

import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle,
  DrawerTrigger,
} from '../index.js'
import type { DrawerDesignProps } from '../types.js'

/** The sheet drawn open inside its own box over a scrim, as the frame draws it: not modal, and it takes no focus. */
function Stage({ placement, size }: DrawerDesignProps) {
  const root = useRef<HTMLDivElement>(null)
  return (
    <div ref={root} data-stage="" className="relative min-h-87 w-full [contain:paint]">
      <div aria-hidden className="absolute inset-0 bg-overlay" />
      <DrawerRoot placement={placement} size={size} defaultOpen modal={false}>
        <DrawerPopup container={root} initialFocus={false} className="max-h-full">
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
    </div>
  )
}

/** The docs stage: the default sheet, with the schema's props passed to the root, so the Try it
 * controls drive it. size only sets the width of a start or an end sheet. With stage it is the
 * Stage above; the tree below stays one return, so the docs can write Try it values into it. */
export default function Demo({ placement, size, stage = false }: DrawerDesignProps & { stage?: boolean } = {}) {
  if (stage) return <Stage placement={placement} size={size} />
  return (
    <DrawerRoot placement={placement} size={size}>
      <DrawerTrigger render={<Button variant="outline">Filters</Button>} />
      <DrawerPopup>
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
}
