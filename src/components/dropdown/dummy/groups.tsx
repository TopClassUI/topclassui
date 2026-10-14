import { Button } from '#components/button/index.js'
import {
  DropdownGroup, DropdownGroupLabel, DropdownItem, DropdownPopup, DropdownRoot, DropdownSeparator, DropdownTrigger,
} from '../index.js'

/** Two groups, each named by its label, with a line between them. A label is no row: the
 * arrow keys pass it, and a screen reader reads it as the name of its group. */
export default function Demo() {
  return (
    <DropdownRoot>
      <DropdownTrigger render={<Button variant="outline">View</Button>} />
      <DropdownPopup>
        <DropdownGroup>
          <DropdownGroupLabel>Sort by</DropdownGroupLabel>
          <DropdownItem>Name</DropdownItem>
          <DropdownItem>Last edited</DropdownItem>
        </DropdownGroup>
        <DropdownSeparator />
        <DropdownGroup>
          <DropdownGroupLabel>Show as</DropdownGroupLabel>
          <DropdownItem>Grid</DropdownItem>
          <DropdownItem>Table</DropdownItem>
        </DropdownGroup>
      </DropdownPopup>
    </DropdownRoot>
  )
}
