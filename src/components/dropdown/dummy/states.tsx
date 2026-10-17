import { pencilSimple } from '#icons/data/pencil-simple.js'
import { trash } from '#icons/data/trash.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import {
  DropdownGroup, DropdownGroupLabel, DropdownItem, DropdownPopup, DropdownRoot, DropdownSeparator, DropdownTrigger,
} from '../index.js'

/** One trigger per state, named after it: a menu only mounts in the browser, so a server page
 * shows each closed. Open, a disabled row, a danger row, and rows in a named group. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <DropdownRoot>
        <DropdownTrigger render={<Button variant="outline">Open</Button>} />
        <DropdownPopup>
          <DropdownItem>Profile</DropdownItem>
          <DropdownItem>Settings</DropdownItem>
        </DropdownPopup>
      </DropdownRoot>
      <DropdownRoot>
        <DropdownTrigger render={<Button variant="outline">Disabled row</Button>} />
        <DropdownPopup>
          <DropdownItem>Duplicate</DropdownItem>
          <DropdownItem icon={<Svg icon={pencilSimple} />} disabled>Rename</DropdownItem>
        </DropdownPopup>
      </DropdownRoot>
      <DropdownRoot>
        <DropdownTrigger render={<Button variant="outline">Danger row</Button>} />
        <DropdownPopup>
          <DropdownItem>Move to archive</DropdownItem>
          <DropdownSeparator />
          <DropdownItem icon={<Svg icon={trash} />} tone="danger">Delete project</DropdownItem>
        </DropdownPopup>
      </DropdownRoot>
      <DropdownRoot>
        <DropdownTrigger render={<Button variant="outline">Grouped</Button>} />
        <DropdownPopup>
          <DropdownGroup>
            <DropdownGroupLabel>Sort by</DropdownGroupLabel>
            <DropdownItem>Name</DropdownItem>
            <DropdownItem>Last edited</DropdownItem>
          </DropdownGroup>
        </DropdownPopup>
      </DropdownRoot>
    </div>
  )
}
