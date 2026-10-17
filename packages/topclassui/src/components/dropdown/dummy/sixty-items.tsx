import { Button } from '#components/button/index.js'
import { DropdownItem, DropdownPopup, DropdownRoot, DropdownTrigger } from '../index.js'

const ROWS = Array.from({ length: 60 }, (_, index) => index + 1)

/** Sixty rows. The menu shows about seven (--tc-list-rows), cuts the last one so it is plain
 * there are more, and scrolls inside itself (R-10.5-1). Every row is mounted: the arrow keys
 * and type-ahead reach all sixty, and the page behind does not move. */
export default function Demo() {
  return (
    <DropdownRoot>
      <DropdownTrigger render={<Button variant="outline">Time zone</Button>} />
      <DropdownPopup>
        {ROWS.map((row) => <DropdownItem key={row}>Zone {row}</DropdownItem>)}
      </DropdownPopup>
    </DropdownRoot>
  )
}
