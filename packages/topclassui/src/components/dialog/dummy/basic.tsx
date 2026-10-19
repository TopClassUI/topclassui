import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle,
  DialogTrigger,
} from '../index.js'

/** The docs sample without its form: a header with the built-in x, a body and a footer.
 * Each label sits inside the Button passed to render, so a server render keeps it whole. */
export default function Demo() {
  return (
    <DialogRoot>
      <DialogTrigger render={<Button>Publish</Button>} />
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Publish changes</DialogTitle>
          <DialogDescription>Your changes go live right away.</DialogDescription>
        </DialogHeader>
        <DialogBody>11 files changed since the last publish.</DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="soft" tone="neutral" size="sm">Cancel</Button>} />
          <DialogClose render={<Button size="sm">Publish now</Button>} />
        </DialogFooter>
      </DialogPopup>
    </DialogRoot>
  )
}
