import { arrowSquareOut } from '#icons/data/arrow-square-out.js'
import { copy } from '#icons/data/copy.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import {
  PopoverClose, PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger,
} from '../index.js'

/** The drawing: a title beside the x, a line of text and one action, under the trigger. The label
 * sits inside the Button passed to render, so a server render keeps it whole. */
export default function Demo() {
  return (
    <PopoverRoot>
      <PopoverTrigger render={<Button variant="outline" size="sm"><Svg icon={arrowSquareOut} />Share</Button>} />
      <PopoverPopup>
        <div className="flex items-center justify-between gap-2">
          <PopoverTitle>Share this page</PopoverTitle>
          <PopoverClose />
        </div>
        <PopoverDescription>Anyone with the link can read it. Only your team can edit.</PopoverDescription>
        <Button size="sm" className="self-start"><Svg icon={copy} />Copy link</Button>
      </PopoverPopup>
    </PopoverRoot>
  )
}
