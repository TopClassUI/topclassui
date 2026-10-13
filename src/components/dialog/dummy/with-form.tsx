import { Button } from '#components/button/index.js'
import { Input } from '#components/input/index.js'
import {
  DialogBody, DialogClose, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle, DialogTrigger,
} from '../index.js'

/** One form with display contents wraps the three bars, so the footer's submit button belongs
 * to it and a Server Action needs no client handler. autoFocus puts the first focus in the field. */
export default function Demo() {
  return (
    <DialogRoot>
      <DialogTrigger render={<Button variant="outline">Rename</Button>} />
      <DialogPopup>
        <form className="contents">
          <DialogHeader>
            <DialogTitle>Rename this project</DialogTitle>
          </DialogHeader>
          <DialogBody className="grid gap-1">
            <label htmlFor="demo-project-name" className="font-medium text-body">Name</label>
            <Input id="demo-project-name" name="name" defaultValue="Website redesign" required fullWidth autoFocus />
          </DialogBody>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">Cancel</Button>} />
            <Button type="submit">Save</Button>
          </DialogFooter>
        </form>
      </DialogPopup>
    </DialogRoot>
  )
}
