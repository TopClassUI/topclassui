import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle,
  DialogTrigger,
} from '../index.js'

/** The drawn confirm: a press outside does not close it, so the answer is one of the two
 * buttons, the x or Escape. The consequence is the description, so a screen reader reads it
 * with the title when the dialog opens. No AlertDialog exists; this is a Dialog with one prop. */
export default function Demo() {
  return (
    <DialogRoot disablePointerDismissal>
      <DialogTrigger render={<Button variant="outline" tone="danger">Delete project</Button>} />
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Delete this project?</DialogTitle>
        </DialogHeader>
        <DialogBody>
          <DialogDescription>This removes the project and every file in it. This cannot be undone.</DialogDescription>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" size="sm">Cancel</Button>} />
          <DialogClose render={<Button tone="danger" size="sm">Delete</Button>} />
        </DialogFooter>
      </DialogPopup>
    </DialogRoot>
  )
}
