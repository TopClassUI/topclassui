import { Button } from '#components/button/index.js'
import {
  PopoverClose, PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger,
} from '../index.js'

/** One trigger per state, named after it: a popup only mounts in the browser, so a server page
 * shows each closed. Open below, open above, with its x, modal, and opened by hover. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <PopoverRoot>
        <PopoverTrigger render={<Button variant="outline">Open</Button>} />
        <PopoverPopup>
          <PopoverTitle>Open</PopoverTitle>
          <PopoverDescription>Below its trigger, the default.</PopoverDescription>
        </PopoverPopup>
      </PopoverRoot>
      <PopoverRoot>
        <PopoverTrigger render={<Button variant="outline">Above</Button>} />
        <PopoverPopup placement="top">
          <PopoverTitle>Above</PopoverTitle>
          <PopoverDescription>It flips below when the top has no room.</PopoverDescription>
        </PopoverPopup>
      </PopoverRoot>
      <PopoverRoot>
        <PopoverTrigger render={<Button variant="outline">With close</Button>} />
        <PopoverPopup>
          <div className="flex items-start justify-between gap-2">
            <PopoverTitle>With close</PopoverTitle>
            <PopoverClose />
          </div>
          <PopoverDescription>The x dismisses it, as Escape and a press outside do.</PopoverDescription>
        </PopoverPopup>
      </PopoverRoot>
      <PopoverRoot modal>
        <PopoverTrigger render={<Button variant="outline">Modal</Button>} />
        <PopoverPopup>
          <div className="flex items-start justify-between gap-2">
            <PopoverTitle>Modal</PopoverTitle>
            <PopoverClose />
          </div>
          <PopoverDescription>The page behind takes no press and does not scroll.</PopoverDescription>
        </PopoverPopup>
      </PopoverRoot>
      <PopoverRoot>
        <PopoverTrigger openOnHover delay={100} closeDelay={200} render={<Button variant="ghost">On hover</Button>} />
        <PopoverPopup>
          <PopoverTitle>On hover</PopoverTitle>
          <PopoverDescription>It opens after the delay and stays long enough to reach.</PopoverDescription>
        </PopoverPopup>
      </PopoverRoot>
    </div>
  )
}
