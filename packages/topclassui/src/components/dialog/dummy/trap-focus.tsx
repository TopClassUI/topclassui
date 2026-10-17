import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '../index.js'

/** modal="trap-focus": no scrim, and the pointer keeps the page behind: it scrolls and its
 * buttons take a press. The keyboard and a screen reader stay in the dialog: Tab goes round
 * inside it and the page is hidden from them until it closes. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <DialogRoot modal="trap-focus">
        <DialogTrigger render={<Button variant="outline">Inspect</Button>} />
        <DialogPopup size="xs">
          <DialogHeader>
            <DialogTitle>Inspector</DialogTitle>
          </DialogHeader>
          <DialogBody>Point at anything on the page behind. The keyboard stays in this panel.</DialogBody>
          <DialogFooter>
            <DialogClose render={<Button>Done</Button>} />
          </DialogFooter>
        </DialogPopup>
      </DialogRoot>
      <Button variant="ghost">Behind the panel</Button>
    </div>
  )
}
