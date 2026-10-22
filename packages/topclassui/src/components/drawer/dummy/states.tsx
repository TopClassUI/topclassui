'use client'

import { useRef } from 'react'

import { cn } from '#shared/cn.js'
import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger,
} from '../index.js'

const CELL = 'relative h-18 w-33 justify-self-center overflow-hidden rounded-box [contain:paint]'
const BAR = 'min-h-2 rounded-chip bg-surface-raised'
const HEADER = 'border-b-0 py-3 ps-2.5'
const LABEL = 'font-mono text-xs/tight font-normal text-muted'

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

// R-5.3-2: part-way out toward the inline end, as a finger leaves it mid-swipe; the edge is the ring, as the focus draws it.
const DRAGGING = 'translate-x-[calc(0.5rem*var(--tc-dir))]'
const TRAPPED = 'border-s-(length:--tc-ring-width) border-s-ring'

/** One cell, captioned by its title: a small side sheet open at the inline end over the page and its scrim, not modal
 * and taking no focus. `className` draws dragging or the trapped focus on the sheet, as a picture. */
function Side({ title, className }: { title: string, className?: string }) {
  const box = useRef<HTMLDivElement>(null)
  return (
    <div ref={box} title={title} className={CELL}>
      <PageBehind />
      <div aria-hidden className="absolute inset-0 bg-overlay" />
      <DrawerRoot defaultOpen modal={false} size="custom">
        <DrawerPopup container={box} initialFocus={false} className={cn('max-h-full w-16 *:first:not-last:pe-9', className)}>
          <DrawerHeader className={HEADER}>
            <DrawerTitle className={LABEL}>sheet</DrawerTitle>
          </DrawerHeader>
        </DrawerPopup>
      </DrawerRoot>
    </div>
  )
}

/** Every state the frame draws, one equal cell each, captioned by its title: the closed trigger, a small side and bottom
 * sheet open over the page and a scrim, and the side sheet drawn mid-drag and with its focus trapped, as pictures. */
export default function Demo() {
  const bottom = useRef<HTMLDivElement>(null)
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
      <div title="closed" className="grid h-18 place-items-center">
        <DrawerRoot>
          <DrawerTrigger render={<Button variant="outline" size="sm">Open</Button>} />
          <DrawerPopup>
            <DrawerHeader>
              <DrawerTitle>Opened</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>Its trigger opened it; Escape, the x or Done closes it.</DrawerBody>
            <DrawerFooter>
              <DrawerClose render={<Button>Done</Button>} />
            </DrawerFooter>
          </DrawerPopup>
        </DrawerRoot>
      </div>
      <Side title="side sheet" />
      <div ref={bottom} title="bottom sheet" className={CELL}>
        <PageBehind />
        <div aria-hidden className="absolute inset-0 bg-overlay" />
        <DrawerRoot defaultOpen modal={false} placement="bottom">
          <DrawerPopup container={bottom} initialFocus={false} className="max-h-full">
            <DrawerHeader className={HEADER}>
              <DrawerTitle className={LABEL}>sheet</DrawerTitle>
            </DrawerHeader>
          </DrawerPopup>
        </DrawerRoot>
      </div>
      <Side title="dragging" className={DRAGGING} />
      <Side title="focus trapped" className={TRAPPED} />
    </div>
  )
}
