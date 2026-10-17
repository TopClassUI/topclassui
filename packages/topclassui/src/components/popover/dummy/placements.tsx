import { Button } from '#components/button/index.js'
import { PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index.js'
import type { PopoverPlacement } from '../types.js'

const PLACES: PopoverPlacement[] = [
  'top-start', 'top', 'top-end',
  'start-top', 'start', 'start-bottom',
  'end-top', 'end', 'end-bottom',
  'bottom-start', 'bottom', 'bottom-end',
]

/** All twelve placements, one outline Button each. The label names the placement and the
 * popup is titled by the same word. start and end are the inline sides, so they mirror. */
export default function Demo() {
  return (
    <div className="grid max-w-[31.5rem] grid-cols-[repeat(auto-fill,minmax(min(100%,8rem),1fr))] gap-3 p-4 sm:p-12">
      {PLACES.map((place) => (
        <PopoverRoot key={place}>
          <PopoverTrigger render={<Button variant="outline" size="sm">{place}</Button>} />
          <PopoverPopup placement={place}>
            <PopoverTitle>{place}</PopoverTitle>
            <PopoverDescription>It flips to the other side where this one has no room.</PopoverDescription>
          </PopoverPopup>
        </PopoverRoot>
      ))}
    </div>
  )
}
