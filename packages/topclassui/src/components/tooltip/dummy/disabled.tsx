import { pencilSimple } from '#icons/data/pencil-simple.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'

/** TooltipRoot disabled: the Button still works and its aria-label still names it, but
 * no tooltip opens on hover or focus. Base UI takes the prop untouched. */
export default function Demo() {
  return (
    <TooltipRoot disabled>
      <TooltipTrigger
        render={
          <Button variant="outline" aria-label="Rename">
            <Svg icon={pencilSimple} />
          </Button>
        }
      />
      <TooltipPopup>Rename</TooltipPopup>
    </TooltipRoot>
  )
}
