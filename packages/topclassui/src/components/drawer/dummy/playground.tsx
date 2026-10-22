'use client'

import { useRef } from 'react'

import { cn } from '#shared/cn.js'
import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle,
  DrawerTrigger,
} from '../index.js'
import type { DrawerDesignProps } from '../types.js'

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

/** The frame's filters sheet drawn open in a 420 by 260 px box over the page and a scrim, 220 px wide until Try it sets
 * a size: not modal, and it takes no focus. */
function Stage({ placement, size }: DrawerDesignProps) {
  const root = useRef<HTMLDivElement>(null)
  return (
    <div ref={root} data-stage="" className="relative h-65 w-105 max-w-full overflow-hidden rounded-box [contain:paint]">
      <PageBehind />
      <div aria-hidden className="absolute inset-0 bg-overlay" />
      <DrawerRoot placement={placement} size={size} defaultOpen modal={false}>
        <DrawerPopup container={root} initialFocus={false} className={cn('max-h-full', size === undefined && 'max-w-55')}>
          <DrawerHeader>
            <DrawerTitle>Filters</DrawerTitle>
          </DrawerHeader>
          <DrawerBody className="grid content-start gap-2.5">
            <p>Status</p>
            <p>Owner</p>
            <p>Updated</p>
          </DrawerBody>
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
