import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle,
  DrawerTrigger,
} from '../index.js'

/** The default: a sheet at the inline end, with a header, a body and a footer. It always ends
 * with the x. Each label sits inside the Button passed to render, so a server render keeps it whole. */
export default function Demo() {
  return (
    <DrawerRoot>
      <DrawerTrigger render={<Button variant="outline">Filters</Button>} />
      <DrawerPopup>
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <DrawerDescription>Narrow the list of projects.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody className="grid content-start gap-2.5">
          <p>Status</p>
          <p>Owner</p>
          <p>Updated</p>
        </DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button variant="outline">Reset</Button>} />
          <DrawerClose render={<Button>Apply</Button>} />
        </DrawerFooter>
      </DrawerPopup>
    </DrawerRoot>
  )
}
