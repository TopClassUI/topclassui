import { Button } from '#components/button/index.js'
import { DropdownItem, DropdownPopup, DropdownRoot, DropdownTrigger } from '../index.js'
import type { DropdownPlacement } from '../types.js'

const PLACES: DropdownPlacement[] = [
  'top-start', 'top', 'top-end',
  'start-top', 'start', 'start-bottom',
  'end-top', 'end', 'end-bottom',
  'bottom-start', 'bottom', 'bottom-end',
]

/** All twelve placements, one outline Button each, named after the placement it opens at.
 * start and end are the inline sides, so they mirror; a side with no room flips. */
export default function Demo() {
  return (
    <div className="grid grid-cols-3 gap-3 p-12">
      {PLACES.map((place) => (
        <DropdownRoot key={place}>
          <DropdownTrigger render={<Button variant="outline" size="sm">{place}</Button>} />
          <DropdownPopup placement={place}>
            <DropdownItem>Rename</DropdownItem>
            <DropdownItem>Duplicate</DropdownItem>
          </DropdownPopup>
        </DropdownRoot>
      ))}
    </div>
  )
}
