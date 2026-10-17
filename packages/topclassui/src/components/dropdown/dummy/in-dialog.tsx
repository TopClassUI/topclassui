import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '#components/dialog/index.js'
import { DropdownItem, DropdownPopup, DropdownRoot, DropdownTrigger } from '../index.js'

/** A menu inside a dialog. It opens above the dialog, and one Escape closes one thing: the
 * menu first, with the focus back on its trigger, and the dialog on the next press. */
export default function Demo() {
  return (
    <DialogRoot>
      <DialogTrigger render={<Button variant="outline">Invite people</Button>} />
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Invite people</DialogTitle>
        </DialogHeader>
        <DialogBody className="flex items-center justify-between gap-3">
          <span>New members join as</span>
          <DropdownRoot>
            <DropdownTrigger render={<Button variant="outline" size="sm">Role</Button>} />
            <DropdownPopup placement="bottom-end">
              <DropdownItem>Viewer</DropdownItem>
              <DropdownItem>Editor</DropdownItem>
              <DropdownItem>Owner</DropdownItem>
            </DropdownPopup>
          </DropdownRoot>
        </DialogBody>
        <DialogFooter>
          <DialogClose render={<Button>Done</Button>} />
        </DialogFooter>
      </DialogPopup>
    </DialogRoot>
  )
}
