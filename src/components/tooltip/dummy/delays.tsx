import { copy } from '#icons/data/copy.js'
import { gear } from '#icons/data/gear.js'
import { trash } from '#icons/data/trash.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'

/** A toolbar of three icon-only Buttons: Copy opens at once, Delete waits Base UI's
 * 600 ms because it passes no delay, and Settings stays 300 ms after the pointer leaves. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <TooltipRoot>
        <TooltipTrigger
          delay={0}
          render={
            <Button variant="ghost" aria-label="Copy">
              <Svg icon={copy} />
            </Button>
          }
        />
        <TooltipPopup>Copy</TooltipPopup>
      </TooltipRoot>
      <TooltipRoot>
        <TooltipTrigger
          render={
            <Button variant="ghost" aria-label="Delete this row">
              <Svg icon={trash} />
            </Button>
          }
        />
        <TooltipPopup placement="bottom">Delete this row</TooltipPopup>
      </TooltipRoot>
      <TooltipRoot>
        <TooltipTrigger
          closeDelay={300}
          render={
            <Button variant="ghost" aria-label="Settings">
              <Svg icon={gear} />
            </Button>
          }
        />
        <TooltipPopup>Settings</TooltipPopup>
      </TooltipRoot>
    </div>
  )
}
