import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle,
  DrawerTrigger,
} from '../index.js'

const ENTRIES = Array.from({ length: 60 }, (_, index) => index + 1)

/** Sixty rows: the body scrolls inside the sheet, and the header and the footer keep their
 * places above and below it (R-10.5-1). At its end the page behind does not take over the scroll. */
export default function Demo() {
  return (
    <DrawerRoot>
      <DrawerTrigger render={<Button variant="outline">Activity</Button>} />
      <DrawerPopup>
        <DrawerHeader>
          <DrawerTitle>Activity</DrawerTitle>
          <DrawerDescription>Sixty entries. Scroll to read them all.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="grid content-start gap-3">
          {ENTRIES.map((entry) => (
            <p key={entry}>Entry {entry}. A file was changed in the shared folder.</p>
          ))}
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline">Mark all as read</Button>} />
          <DrawerClose render={<Button>Done</Button>} />
        </DrawerFooter>
      </DrawerPopup>
    </DrawerRoot>
  )
}
