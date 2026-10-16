import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle,
  DrawerTrigger,
} from '../index.js'

/** placement="top": a sheet that comes down from the top edge. A swipe up closes it. */
export default function Demo() {
  return (
    <DrawerRoot placement="top">
      <DrawerTrigger render={<Button variant="soft">What is new</Button>} />
      <DrawerPopup>
        <DrawerHeader>
          <DrawerTitle>Version 2.4</DrawerTitle>
          <DrawerDescription>Released this week.</DrawerDescription>
        </DrawerHeader>
        <DrawerBody>Tables can now pin their first column, and every menu takes a link.</DrawerBody>
        <DrawerFooter>
          <DrawerClose render={<Button>Got it</Button>} />
        </DrawerFooter>
      </DrawerPopup>
    </DrawerRoot>
  )
}
