import { linkSimple } from '#icons/data/link-simple.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'

/** The drawn sample: an icon-only ghost Button whose aria-label repeats the tooltip text,
 * because touch never shows a tooltip. The icon sits inside the Button, not the trigger,
 * so a Server Component keeps it beside a loading spinner. It opens above, the default. */
export default function Demo() {
  return (
    <TooltipRoot>
      <TooltipTrigger
        render={
          <Button variant="ghost" aria-label="Copy link">
            <Svg icon={linkSimple} />
          </Button>
        }
      />
      <TooltipPopup>Copy link</TooltipPopup>
    </TooltipRoot>
  )
}
