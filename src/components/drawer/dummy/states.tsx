import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger,
} from '../index.js'

const LINES = Array.from({ length: 30 }, (_, index) => index + 1)

/** One trigger per state, named after it: a sheet only mounts in the browser, so a server page
 * shows each closed. A side sheet, a bottom sheet, a scrolled body, focus trapped without a scrim, non-modal. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <DrawerRoot>
        <DrawerTrigger render={<Button variant="outline">Side sheet</Button>} />
        <DrawerPopup>
          <DrawerHeader>
            <DrawerTitle>Side sheet</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>It slides from the inline end, so it mirrors in Arabic.</DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button>Done</Button>} />
          </DrawerFooter>
        </DrawerPopup>
      </DrawerRoot>
      <DrawerRoot placement="bottom">
        <DrawerTrigger render={<Button variant="outline">Bottom sheet</Button>} />
        <DrawerPopup>
          <DrawerHeader>
            <DrawerTitle>Bottom sheet</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>It starts with a grabber; a swipe down closes it.</DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button>Done</Button>} />
          </DrawerFooter>
        </DrawerPopup>
      </DrawerRoot>
      <DrawerRoot>
        <DrawerTrigger render={<Button variant="outline">Scrolled</Button>} />
        <DrawerPopup>
          <DrawerHeader>
            <DrawerTitle>Scrolled</DrawerTitle>
          </DrawerHeader>
          <DrawerBody className="grid content-start gap-3">
            {LINES.map((line) => <p key={line}>Line {line}. The body scrolls; the header and the footer stay put.</p>)}
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button>Done</Button>} />
          </DrawerFooter>
        </DrawerPopup>
      </DrawerRoot>
      <DrawerRoot modal="trap-focus">
        <DrawerTrigger render={<Button variant="outline">Focus trapped</Button>} />
        <DrawerPopup>
          <DrawerHeader>
            <DrawerTitle>Focus trapped</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>No scrim and the page still scrolls, but Tab stays inside the sheet.</DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button>Done</Button>} />
          </DrawerFooter>
        </DrawerPopup>
      </DrawerRoot>
      <DrawerRoot modal={false} size="xs">
        <DrawerTrigger render={<Button variant="outline">Non-modal</Button>} />
        <DrawerPopup>
          <DrawerHeader>
            <DrawerTitle>Non-modal</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>The page beside the sheet stays in use, and focus is not held.</DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button>Done</Button>} />
          </DrawerFooter>
        </DrawerPopup>
      </DrawerRoot>
    </div>
  )
}
