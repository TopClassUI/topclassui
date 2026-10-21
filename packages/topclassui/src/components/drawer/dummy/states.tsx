'use client'

import { useRef } from 'react'

import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger,
} from '../index.js'

const CELL = 'relative h-24 w-36 justify-self-center overflow-hidden rounded-box [contain:paint]'
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

/** Every state the frame draws, one equal cell each, captioned by its title: the closed trigger, then a small side
 * and bottom sheet drawn open inside their cell over the page and a scrim, not modal and taking no focus. */
export default function Demo() {
  const side = useRef<HTMLDivElement>(null)
  const bottom = useRef<HTMLDivElement>(null)
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
      <div title="closed" className="grid h-24 place-items-center">
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
      <div ref={side} title="side sheet" className={CELL}>
        <PageBehind />
        <div aria-hidden className="absolute inset-0 bg-overlay" />
        <DrawerRoot defaultOpen modal={false} size="custom">
          <DrawerPopup container={side} initialFocus={false} className="max-h-full w-24 *:first:not-last:pe-9">
            <DrawerHeader className={HEADER}>
              <DrawerTitle className={LABEL}>sheet</DrawerTitle>
            </DrawerHeader>
          </DrawerPopup>
        </DrawerRoot>
      </div>
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
    </div>
  )
}
