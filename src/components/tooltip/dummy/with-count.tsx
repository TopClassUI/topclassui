import { trash } from '#icons/data/trash.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'

const COUNT = 3

/** An interpolated tooltip, which JSX passes as an array of text: the popup takes it,
 * and the aria-label spells out the same words for the icon-only Button. */
export default function Demo() {
  return (
    <TooltipRoot>
      <TooltipTrigger
        render={
          <Button variant="soft" tone="danger" aria-label={`Delete ${String(COUNT)} rows`}>
            <Svg icon={trash} />
          </Button>
        }
      />
      <TooltipPopup>Delete {COUNT} rows</TooltipPopup>
    </TooltipRoot>
  )
}
