import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger,
} from '../index.js'

/** modal={false}: no scrim, and the page beside the sheet stays in use. It scrolls, its buttons
 * take a press, and a screen reader still reads it. Focus is not held: Tab past the last control,
 * or a press anywhere outside, closes the sheet. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <DrawerRoot modal={false} size="xs">
        <DrawerTrigger render={<Button variant="outline">Outline</Button>} />
        <DrawerPopup>
          <DrawerHeader>
            <DrawerTitle>Outline</DrawerTitle>
          </DrawerHeader>
          <DrawerBody>The page stays live beside this panel, so you can keep working in it.</DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button>Done</Button>} />
          </DrawerFooter>
        </DrawerPopup>
      </DrawerRoot>
      <Button variant="ghost">Behind the panel</Button>
    </div>
  )
}
