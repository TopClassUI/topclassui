import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle,
  DialogTrigger,
} from '../index.js'

const TITLE = 'Move the quarterly report, its eleven attachments and every comment thread to the shared archive of the finance team'
const WORD = 'a'.repeat(300)
const FILE = 'quarterly-report-final-v2-reviewed-by-legal-and-finance-and-signed-off-by-the-board.pdf'

/** Hostile content: a title of many lines, a word of 300 characters and three long actions.
 * The title wraps beside the x, the word breaks inside the body, and a long action wraps onto
 * two lines. On a small phone the body scrolls, so it takes tabIndex for the keyboard. */
export default function Demo() {
  return (
    <DialogRoot>
      <DialogTrigger render={<Button variant="outline">Move to the archive</Button>} />
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>{TITLE}</DialogTitle>
          <DialogDescription>{FILE}</DialogDescription>
        </DialogHeader>
        <DialogBody tabIndex={0}>{WORD}</DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Keep it where it is</Button>} />
          <DialogClose render={<Button variant="outline">Move a copy and keep the original</Button>} />
          <DialogClose render={<Button>Move everything to the archive</Button>} />
        </DialogFooter>
      </DialogPopup>
    </DialogRoot>
  )
}
