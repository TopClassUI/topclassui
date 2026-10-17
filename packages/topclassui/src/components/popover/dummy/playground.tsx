import { Button } from '#components/button/index.js'
import { PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index.js'
import type { PopoverDesignProps } from '../types.js'

/** The docs stage: the basic popover, with the schema's props passed through, so the Try it
 * controls drive it. The delays only apply with openOnHover; a press and the keyboard still open it. */
export default function Demo({ placement, delay, closeDelay }: PopoverDesignProps = {}) {
  return (
    <PopoverRoot>
      <PopoverTrigger openOnHover delay={delay} closeDelay={closeDelay} render={<Button variant="outline">Share</Button>} />
      <PopoverPopup placement={placement}>
        <PopoverTitle>Share this page</PopoverTitle>
        <PopoverDescription>Anyone with the link can read it. Only your team can edit.</PopoverDescription>
        <Button size="sm" className="self-start">Copy link</Button>
      </PopoverPopup>
    </PopoverRoot>
  )
}
