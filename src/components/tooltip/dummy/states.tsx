import { arrowDown } from '#icons/data/arrow-down.js'
import { arrowUp } from '#icons/data/arrow-up.js'
import { clock } from '#icons/data/clock.js'
import { prohibit } from '#icons/data/prohibit.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'

/** One trigger per state, each named after it: a popup only mounts in the browser, so a server
 * page shows each hidden. Above, below, delayed by a second, and disabled. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <TooltipRoot>
        <TooltipTrigger
          render={
            <Button variant="ghost" aria-label="Top">
              <Svg icon={arrowUp} />
            </Button>
          }
        />
        <TooltipPopup>Top</TooltipPopup>
      </TooltipRoot>
      <TooltipRoot>
        <TooltipTrigger
          render={
            <Button variant="ghost" aria-label="Bottom">
              <Svg icon={arrowDown} />
            </Button>
          }
        />
        <TooltipPopup placement="bottom">Bottom</TooltipPopup>
      </TooltipRoot>
      <TooltipRoot>
        <TooltipTrigger
          delay={1000}
          render={
            <Button variant="ghost" aria-label="Delayed">
              <Svg icon={clock} />
            </Button>
          }
        />
        <TooltipPopup>Delayed</TooltipPopup>
      </TooltipRoot>
      <TooltipRoot disabled>
        <TooltipTrigger
          render={
            <Button variant="ghost" aria-label="Disabled">
              <Svg icon={prohibit} />
            </Button>
          }
        />
        <TooltipPopup>Disabled</TooltipPopup>
      </TooltipRoot>
    </div>
  )
}
