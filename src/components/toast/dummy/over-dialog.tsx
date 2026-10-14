'use client'

import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '#components/dialog/index.js'
import { toast } from '../index.js'

/** A toast shown from inside a modal dialog. It is painted above the scrim, on the toast layer. */
export default function Demo() {
  return (
    <DialogRoot>
      <DialogTrigger render={<Button variant="outline">Open settings</Button>} />
      <DialogPopup>
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>
        <DialogBody>Saving keeps this dialog open.</DialogBody>
        <DialogFooter>
          <DialogClose render={<Button variant="outline">Close</Button>} />
          <Button onClick={() => { toast.add({ tone: 'success', title: 'Settings saved', duration: 0 }) }}>Save</Button>
        </DialogFooter>
      </DialogPopup>
    </DialogRoot>
  )
}
