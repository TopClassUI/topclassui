// Loaded into a live page by e2e/dialog.spec.ts: a trigger and a close around a Button that has already run, as a
// Server Component hands it over. The harness has no Flight, so built() does what Flight does on the way to the browser.
import { createElement, type ReactElement } from 'react'
import { createRoot } from 'react-dom/client'

import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '#components/dialog/index.js'

/** The element a client file receives: Button has run, and every key that held undefined is gone. */
function built(props: Parameters<typeof Button>[0] = {}): ReactElement {
  const element = Button(props)
  const kept = Object.entries(element.props as object).filter(([, value]) => value !== undefined)
  return createElement(element.type, Object.fromEntries(kept))
}

function Fixture() {
  return (
    <div id="server-built" style={{ display: 'flex', gap: 12, padding: 24 }}>
      <button type="button" id="before">Before</button>
      <DialogRoot>
        <DialogTrigger disabled render={built({ variant: 'outline' })}>Disabled on the part</DialogTrigger>
        <DialogPopup><DialogBody>This one never opens.</DialogBody></DialogPopup>
      </DialogRoot>
      <DialogRoot>
        <DialogTrigger render={built({ variant: 'outline' })}>Enabled</DialogTrigger>
        <DialogPopup>
          <DialogHeader><DialogTitle>Server-built buttons</DialogTitle></DialogHeader>
          <DialogBody>One of the two actions is disabled on the part.</DialogBody>
          <DialogFooter>
            <DialogClose disabled render={built({ variant: 'outline' })}>Not now</DialogClose>
            <DialogClose render={built()}>Done</DialogClose>
          </DialogFooter>
        </DialogPopup>
      </DialogRoot>
      <button type="button" id="after">After</button>
    </div>
  )
}

const container = document.createElement('div')
document.body.appendChild(container)
createRoot(container).render(<Fixture />)
