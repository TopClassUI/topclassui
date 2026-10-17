import { Button } from '#components/button/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'
import type { TooltipPlacement } from '../types.js'

const PLACES: TooltipPlacement[] = [
  'top-start', 'top', 'top-end',
  'start-top', 'start', 'start-bottom',
  'end-top', 'end', 'end-bottom',
  'bottom-start', 'bottom', 'bottom-end',
]

/** All twelve placements, one outline Button each. The label names the placement and
 * the tooltip shows the same words, so the trigger's name carries the text. */
export default function Demo() {
  return (
    <div className="grid grid-cols-3 gap-3 p-12">
      {PLACES.map((place) => (
        <TooltipRoot key={place}>
          <TooltipTrigger render={<Button variant="outline" size="sm">{place}</Button>} />
          <TooltipPopup placement={place}>{place}</TooltipPopup>
        </TooltipRoot>
      ))}
    </div>
  )
}
