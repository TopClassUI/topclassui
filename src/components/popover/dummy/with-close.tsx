import { Button } from '#components/button/index.js'
import {
  PopoverClose, PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger,
} from '../index.js'

/** A PopoverClose with nothing in it is the x. The caller places it: here in a row with the
 * title, which wraps beside it and never runs under it. A touch screen reader has no Escape
 * key, so a popover that holds more than a line of text carries one. */
export default function Demo() {
  return (
    <PopoverRoot>
      <PopoverTrigger render={<Button variant="outline">Notifications</Button>} />
      <PopoverPopup>
        <div className="flex items-start justify-between gap-2">
          <PopoverTitle>Notifications are paused</PopoverTitle>
          <PopoverClose />
        </div>
        <PopoverDescription>You will get one summary tomorrow at nine instead.</PopoverDescription>
      </PopoverPopup>
    </PopoverRoot>
  )
}
