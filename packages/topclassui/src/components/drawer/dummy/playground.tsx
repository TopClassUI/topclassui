import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle,
  DrawerTrigger,
} from '../index.js'
import type { DrawerDesignProps } from '../types.js'

/** The docs stage: the default sheet, with the schema's props passed to the root, so the Try it
 * controls drive it. size only sets the width of a start or an end sheet. */
export default function Demo({ placement, size }: DrawerDesignProps = {}) {
  return (
    <DrawerRoot placement={placement} size={size}>
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
