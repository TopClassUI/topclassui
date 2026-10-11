import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle,
  DrawerTrigger,
} from '../index.js'

const TITLE = 'Move the quarterly report, its eleven attachments and every comment thread to the shared archive of the finance team'
const WORD = 'a'.repeat(300)
const FILE = 'quarterly-report-final-v2-reviewed-by-legal-and-finance-and-signed-off-by-the-board.pdf'

/** Hostile content: a title of many lines, a word of 300 characters and three long actions.
 * The title wraps clear of the x, the word breaks inside the body, and a long action wraps onto
 * two lines. Where the bars leave the body no room, the sheet scrolls as one. */
export default function Demo() {
  return (
    <DrawerRoot>
      <DrawerTrigger render={<Button variant="outline">Move to the archive</Button>} />
      <DrawerPopup>
        <DrawerHeader>
          <DrawerTitle>{TITLE}</DrawerTitle>
          <DrawerDescription>{FILE}</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>{WORD}</DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline">Keep it where it is</Button>} />
          <DrawerClose render={<Button variant="outline">Move a copy and keep the original</Button>} />
          <DrawerClose render={<Button>Move everything to the archive</Button>} />
        </DrawerFooter>
      </DrawerPopup>
    </DrawerRoot>
  )
}
