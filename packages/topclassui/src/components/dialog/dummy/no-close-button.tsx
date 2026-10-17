import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle,
  DialogTrigger,
} from '../index.js'

/** closeButton={false} leaves the x out, so the footer must hold a DialogClose: a touch
 * screen reader has no Escape key and needs a control that closes the dialog. */
export default function Demo() {
  return (
    <DialogRoot>
      <DialogTrigger render={<Button variant="soft">What is new</Button>} />
      <DialogPopup size="sm">
        <DialogHeader closeButton={false}>
          <DialogTitle>Version 2.4</DialogTitle>
          <DialogDescription>Released this week.</DialogDescription>
        </DialogHeader>
        <DialogBody>Tables can now pin their first column, and every menu takes a link.</DialogBody>
        <DialogFooter>
          <DialogClose render={<Button>Got it</Button>} />
        </DialogFooter>
      </DialogPopup>
    </DialogRoot>
  )
}
