'use client'

import { useRef, type ReactNode } from 'react'

import { SCROLLBAR } from '#shared/classes.js'
import { cn } from '#shared/cn.js'
import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '../index.js'

const LINES = Array.from({ length: 12 }, (_, index) => index + 1)

const CELL = 'relative h-28 w-36 justify-self-center overflow-hidden rounded-box [contain:paint]'
const BAR = 'min-h-2 rounded-chip bg-surface-raised'
const LABEL = 'font-mono text-xs/tight font-normal text-muted'
// The ring the focus draws, as a picture: the focus stays where it was.
const TRAPPED = 'outline-solid outline-(length:--tc-ring-width) outline-offset-(length:--tc-ring-offset) outline-ring'
// The cell is under 15rem tall, where a real body stops scrolling and the popup scrolls as one; this body still scrolls.
const SCROLLED = `grid gap-1 p-2.5 font-mono text-xs [@container(height<15rem)]:shrink [@container(height<15rem)]:overflow-y-auto ${SCROLLBAR}`

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

/** One cell, captioned by its title: a small dialog drawn open over the page and its scrim inside the cell, not modal,
 * and taking no focus. The cell is its screen, so the popup is held to the cell's height as a page holds it to the viewport's. */
function Open({ title, alert = false, className, children }: { title: string, alert?: boolean, className?: string, children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  return (
    <div ref={box} title={title} className={CELL}>
      <PageBehind />
      <div aria-hidden className="absolute inset-0 bg-overlay" />
      <DialogRoot defaultOpen modal={false} disablePointerDismissal={alert}>
        <DialogPopup size="custom" container={box} initialFocus={false} className={cn('max-h-[100cqh] w-28', className)}>{children}</DialogPopup>
      </DialogRoot>
    </div>
  )
}

/** Every state, one equal cell each, captioned by its title: closed, open, an alert that a press outside cannot close,
 * a body long enough to scroll, whose bars then draw their lines, and focus trapped, drawn as its ring. */
export default function Demo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
      <div title="closed" className="grid h-28 place-items-center">
        <DialogRoot>
          <DialogTrigger render={<Button variant="outline" size="sm">Open</Button>} />
          <DialogPopup>
            <DialogHeader>
              <DialogTitle>Open</DialogTitle>
            </DialogHeader>
            <DialogBody>The page behind is still, dimmed and hidden from a screen reader.</DialogBody>
            <DialogFooter>
              <DialogClose render={<Button>Done</Button>} />
            </DialogFooter>
          </DialogPopup>
        </DialogRoot>
      </div>
      <Open title="open">
        <DialogHeader closeButton={false} className="border-b-0 p-2.5">
          <DialogTitle className={LABEL}>dialog</DialogTitle>
        </DialogHeader>
      </Open>
      <Open title="alert" alert>
        <DialogHeader closeButton={false} className="border-b-0 p-2.5">
          <DialogTitle className={LABEL}>alert</DialogTitle>
        </DialogHeader>
      </Open>
      <Open title="scrolled">
        <DialogHeader closeButton={false} className="p-2.5">
          <DialogTitle className={LABEL}>dialog</DialogTitle>
        </DialogHeader>
        <DialogBody className={SCROLLED}>
          {LINES.map((line) => <p key={line}>line {line}</p>)}
        </DialogBody>
      </Open>
      <Open title="focus trapped" className={TRAPPED}>
        <DialogHeader closeButton={false} className="border-b-0 p-2.5">
          <DialogTitle className={LABEL}>dialog</DialogTitle>
        </DialogHeader>
      </Open>
    </div>
  )
}
