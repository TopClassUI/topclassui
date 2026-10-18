import { linkSimple } from '#icons/data/link-simple.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'
import type { TooltipDesignProps } from '../types.js'

/** The docs stage: the basic tooltip, with the schema's props passed through, so the Try it
 * controls drive it. The delays go to the trigger and the placement to the popup. */
export default function Demo({ placement, delay, closeDelay }: TooltipDesignProps = {}) {
  return (
    <TooltipRoot>
      <TooltipTrigger
        delay={delay}
        closeDelay={closeDelay}
        render={
          <Button variant="ghost" aria-label="Copy link">
            <Svg icon={linkSimple} />
          </Button>
        }
      />
      <TooltipPopup placement={placement}>Copy link</TooltipPopup>
    </TooltipRoot>
  )
}
