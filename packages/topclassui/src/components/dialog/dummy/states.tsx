import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '../index.js'

const LINES = Array.from({ length: 30 }, (_, index) => index + 1)

/** One trigger per state, named after it: a popup only mounts in the browser, so a server page
 * shows each closed. Open, an alert a press outside cannot close, a scrolled body, focus trapped without a scrim, non-modal. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
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
      <DialogRoot disablePointerDismissal>
        <DialogTrigger render={<Button variant="outline">Alert</Button>} />
        <DialogPopup size="sm">
          <DialogHeader>
            <DialogTitle>Alert</DialogTitle>
          </DialogHeader>
          <DialogBody>A press outside does not close it: answer with a button, the x or Escape.</DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <DialogClose render={<Button tone="danger">Delete</Button>} />
          </DialogFooter>
        </DialogPopup>
      </DialogRoot>
      <DialogRoot>
        <DialogTrigger render={<Button variant="outline">Scrolled</Button>} />
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>Scrolled</DialogTitle>
          </DialogHeader>
          <DialogBody className="grid gap-3">
            {LINES.map((line) => <p key={line}>Line {line}. The body scrolls; the header and the footer stay put.</p>)}
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button>Done</Button>} />
          </DialogFooter>
        </DialogPopup>
      </DialogRoot>
      <DialogRoot modal="trap-focus">
        <DialogTrigger render={<Button variant="outline">Focus trapped</Button>} />
        <DialogPopup>
          <DialogHeader>
            <DialogTitle>Focus trapped</DialogTitle>
          </DialogHeader>
          <DialogBody>No scrim and the page still scrolls, but Tab stays inside the dialog.</DialogBody>
          <DialogFooter>
            <DialogClose render={<Button>Done</Button>} />
          </DialogFooter>
        </DialogPopup>
      </DialogRoot>
      <DialogRoot modal={false}>
        <DialogTrigger render={<Button variant="outline">Non-modal</Button>} />
        <DialogPopup size="xs">
          <DialogHeader>
            <DialogTitle>Non-modal</DialogTitle>
          </DialogHeader>
          <DialogBody>The page behind stays in use, and focus is not held.</DialogBody>
          <DialogFooter>
            <DialogClose render={<Button>Done</Button>} />
          </DialogFooter>
        </DialogPopup>
      </DialogRoot>
    </div>
  )
}
