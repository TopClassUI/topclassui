import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger,
} from '../index.js'

/** modal="trap-focus": no scrim, and the pointer keeps the page beside the sheet: it scrolls and
 * its buttons take a press. The keyboard and a screen reader stay in the sheet: Tab goes round
 * inside it and the page is hidden from them until it closes. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <DrawerRoot modal="trap-focus" size="xs">
        <DrawerTrigger render={<Button variant="outline">Inspect</Button>} />
        <DrawerPopup>
          <DrawerHeader>
            <DrawerTitle>Inspector</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>Point at anything on the page beside this panel. The keyboard stays in it.</DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button>Done</Button>} />
          </DrawerFooter>
        </DrawerPopup>
      </DrawerRoot>
      <Button variant="ghost">Behind the panel</Button>
    </div>
  )
}
