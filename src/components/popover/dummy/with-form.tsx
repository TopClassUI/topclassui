import { Button } from '#components/button/index.js'
import { Input } from '#components/input/index.js'
import { PopoverClose, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index.js'

/** A field in a popover. The form goes inside the popup, never on it: role="dialog" on a form
 * fails axe. autoFocus puts the first focus in the field, and Cancel closes without saving. */
export default function Demo() {
  return (
    <PopoverRoot>
      <PopoverTrigger render={<Button variant="outline">Rename</Button>} />
      <PopoverPopup>
        <PopoverTitle>Rename this project</PopoverTitle>
        <form className="grid gap-3">
          <div className="grid gap-1">
            <label htmlFor="demo-popover-name" className="font-medium text-body">Name</label>
            <Input id="demo-popover-name" name="name" defaultValue="Website redesign" required fullWidth autoFocus />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <PopoverClose render={<Button variant="outline" size="sm">Cancel</Button>} />
            <Button type="submit" size="sm">Save</Button>
          </div>
        </form>
      </PopoverPopup>
    </PopoverRoot>
  )
}
