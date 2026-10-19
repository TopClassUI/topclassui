'use client'

import { useRef } from 'react'

import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger,
} from '../index.js'

const CELL = 'relative h-60 w-72 overflow-hidden rounded-box border-(length:--tc-line-width) border-line [contain:paint]'

/** Every state the frame draws, one cell each, captioned by its title: the closed trigger, then a side
 * and a bottom sheet drawn open inside their cell over a scrim, not modal and taking no focus. */
export default function Demo() {
  const side = useRef<HTMLDivElement>(null)
  const bottom = useRef<HTMLDivElement>(null)
  return (
    <div className="flex flex-wrap items-start gap-4">
      <div title="closed" className="flex h-60 w-72 items-center justify-center">
        <DrawerRoot>
          <DrawerTrigger render={<Button variant="outline">Open</Button>} />
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
        <div aria-hidden className="absolute inset-0 bg-overlay" />
        <DrawerRoot defaultOpen modal={false} size="xs">
          <DrawerPopup container={side} initialFocus={false} className="max-h-full">
            <DrawerHeader>
              <DrawerTitle>Side sheet</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>It slides from the inline end, so it mirrors in Arabic.</DrawerBody>
            <DrawerFooter>
              <DrawerClose render={<Button>Done</Button>} />
            </DrawerFooter>
          </DrawerPopup>
        </DrawerRoot>
      </div>
      <div ref={bottom} title="bottom sheet" className={CELL}>
        <div aria-hidden className="absolute inset-0 bg-overlay" />
        <DrawerRoot defaultOpen modal={false} placement="bottom">
          <DrawerPopup container={bottom} initialFocus={false} className="max-h-full">
            <DrawerHeader>
              <DrawerTitle>Bottom sheet</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>It starts with a grabber; a swipe down closes it.</DrawerBody>
            <DrawerFooter>
              <DrawerClose render={<Button>Done</Button>} />
            </DrawerFooter>
          </DrawerPopup>
        </DrawerRoot>
      </div>
    </div>
  )
}
