import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle,
  DialogTrigger,
} from '../index.js'

const CLAUSES = Array.from({ length: 40 }, (_, index) => index + 1)

/** A body taller than any screen: it scrolls inside the popup, and the header and the
 * footer keep their places above and below it (R-10.5-1). */
export default function Demo() {
  return (
    <DialogRoot>
      <DialogTrigger render={<Button variant="outline">Read the terms</Button>} />
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Terms of service</DialogTitle>
          <DialogDescription>Forty clauses. Scroll to read them all.</DialogDescription>
        </DialogHeader>
        <DialogBody tabIndex={0} className="grid gap-3">
          {CLAUSES.map((clause) => (
            <p key={clause}>
              Clause {clause}. You keep the rights to what you publish, and you let us store it and show it
              to the people you share it with.
            </p>
          ))}
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Decline</Button>} />
          <DialogClose render={<Button>Accept</Button>} />
        </DialogFooter>
      </DialogPopup>
    </DialogRoot>
  )
}
