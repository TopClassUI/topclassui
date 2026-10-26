import { Button } from '#components/button/index.js'
import { PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index.js'

/** openOnHover: the pointer opens it after delay and it stays closeDelay after the pointer
 * leaves, long enough to reach the link inside. A press and the keyboard still open it, and
 * a tooltip could not hold this link: anything with a link or a control is a Popover. */
export default function Demo() {
  return (
    <PopoverRoot>
      <PopoverTrigger openOnHover delay={100} closeDelay={200} render={<Button variant="ghost">Billing details</Button>} />
      <PopoverPopup placement="bottom-start">
        <PopoverTitle>How billing works</PopoverTitle>
        <PopoverDescription>Only the seats in use are billed.</PopoverDescription>
        <Button variant="link" size="sm" className="self-start" render={<a href="#" />}>Read the guide</Button>
      </PopoverPopup>
    </PopoverRoot>
  )
}
