'use client'

import { useRef, type ReactNode } from 'react'

import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '../index.js'

const LINES = Array.from({ length: 30 }, (_, index) => index + 1)

const cell = 'relative h-72 w-80 overflow-hidden rounded-box border-(length:--tc-line-width) border-line [contain:paint]'

/** One cell, captioned by its title: the dialog drawn open over its scrim inside the cell, not modal, and taking no
 * focus. The cell is its screen, so the popup is held to the cell's height as a page holds it to the viewport's. */
function Open({ title, alert = false, children }: { title: string, alert?: boolean, children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null)
  return (
    <div ref={box} title={title} className={cell}>
      <div aria-hidden className="absolute inset-0 bg-overlay" />
      <DialogRoot defaultOpen modal={false} disablePointerDismissal={alert}>
        <DialogPopup size={alert ? 'sm' : 'md'} container={box} initialFocus={false} className="max-h-[100cqh]">{children}</DialogPopup>
      </DialogRoot>
    </div>
  )
}

/** Every state, one cell each, captioned by its title: closed, open, an alert with no x that a press outside cannot
 * close, and a body long enough to scroll, whose bars then draw their lines. Focus trapped needs a live focus: not drawn. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-start gap-3">
      <div title="closed" className={cell}>
        <div className="grid h-full place-items-center">
          <DialogRoot>
            <DialogTrigger render={<Button variant="outline">Open</Button>} />
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
      </div>
      <Open title="open">
        <DialogHeader>
          <DialogTitle>Publish changes</DialogTitle>
        </DialogHeader>
        <DialogBody>11 files changed since the last publish.</DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="soft" tone="neutral" size="sm">Cancel</Button>} />
          <DialogClose render={<Button size="sm">Publish now</Button>} />
        </DialogFooter>
      </Open>
      <Open title="alert" alert>
        <DialogHeader closeButton={false}>
          <DialogTitle>Delete this project?</DialogTitle>
        </DialogHeader>
        <DialogBody>This removes the project and every file in it.</DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="soft" tone="neutral" size="sm">Cancel</Button>} />
          <DialogClose render={<Button tone="danger" size="sm">Delete</Button>} />
        </DialogFooter>
      </Open>
      <Open title="scrolled">
        <DialogHeader>
          <DialogTitle>Scrolled</DialogTitle>
        </DialogHeader>
        <DialogBody className="grid gap-3">
          {LINES.map((line) => <p key={line}>Line {line}. The body scrolls; the header and the footer stay put.</p>)}
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button size="sm">Done</Button>} />
        </DialogFooter>
      </Open>
    </div>
  )
}
