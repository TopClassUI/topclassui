import { Button } from '#components/button/index.js'
import { Input } from '#components/input/index.js'
import {
  DrawerBody, DrawerClose, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger,
} from '../index.js'

/** A form in a bottom sheet. One form with display contents wraps the three bars, so the submit
 * button in the footer belongs to it. On a phone the keyboard covers the lower half of the screen:
 * a bottom sheet scrolls the field that has the focus clear of it. */
export default function Demo() {
  return (
    <DrawerRoot placement="bottom">
      <DrawerTrigger render={<Button variant="outline">Invite</Button>} />
      <DrawerPopup>
        <form className="contents">
          <DrawerHeader>
            <DrawerTitle>Invite a teammate</DrawerTitle>
          </DrawerHeader>
          <DrawerBody className="grid content-start gap-1">
            <label htmlFor="demo-invite-name" className="font-medium">Name</label>
            <Input id="demo-invite-name" name="name" autoComplete="name" required fullWidth />
            <label htmlFor="demo-invite-email" className="mt-3 font-medium">Email</label>
            <Input id="demo-invite-email" name="email" type="email" autoComplete="email" required fullWidth />
          </DrawerBody>
          <DrawerFooter>
            <DrawerClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit">Send</Button>
          </DrawerFooter>
        </form>
      </DrawerPopup>
    </DrawerRoot>
  )
}
