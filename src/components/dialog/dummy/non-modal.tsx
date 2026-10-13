import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '../index.js'

/** modal={false}: no scrim, and the page behind stays in use. It scrolls, its buttons take a
 * press, and a screen reader still reads it. Focus is not held: Tab past the last control,
 * or a press anywhere outside, closes the dialog. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <DialogRoot modal={false}>
        <DialogTrigger render={<Button variant="outline">Find and replace</Button>} />
        <DialogPopup size="xs">
          <DialogHeader>
            <DialogTitle>Find and replace</DialogTitle>
          </DialogHeader>
          <DialogBody>The page stays live behind this panel, so you can keep working in it.</DialogBody>
          <DialogFooter>
            <DialogClose render={<Button>Done</Button>} />
          </DialogFooter>
        </DialogPopup>
      </DialogRoot>
      <Button variant="ghost">Behind the panel</Button>
    </div>
  )
}
