import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle,
  DialogTrigger,
} from '../index.js'
import type { DialogDesignProps } from '../types.js'

/** The docs stage: the basic dialog, with the schema's props passed through, so the Try it
 * controls drive it. size goes to the popup and closeButton to the header. */
export default function Demo({ size, closeButton }: DialogDesignProps = {}) {
  return (
    <DialogRoot>
      <DialogTrigger render={<Button>Publish</Button>} />
      <DialogPopup size={size}>
        <DialogHeader closeButton={closeButton}>
          <DialogTitle>Publish changes</DialogTitle>
          <DialogDescription>Your changes go live right away.</DialogDescription>
        </DialogHeader>
        <DialogBody>11 files changed since the last publish.</DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Cancel</Button>} />
          <DialogClose render={<Button>Publish now</Button>} />
        </DialogFooter>
      </DialogPopup>
    </DialogRoot>
  )
}
