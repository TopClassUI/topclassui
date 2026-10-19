import { copy } from '#icons/data/copy.js'
import { gear } from '#icons/data/gear.js'
import { pencilSimple } from '#icons/data/pencil-simple.js'
import { trash } from '#icons/data/trash.js'
import { user } from '#icons/data/user.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { DropdownItem, DropdownPopup, DropdownRoot, DropdownSeparator, DropdownTrigger } from '../index.js'

/** The drawing, from the parts: an icon, a shortcut, a disabled row and a destructive one. The
 * label of the trigger sits inside the Button passed to render, so a server render keeps it whole. */
export default function Demo() {
  return (
    <DropdownRoot>
      <DropdownTrigger render={<Button variant="outline" size="sm">Actions</Button>} />
      <DropdownPopup>
        <DropdownItem icon={<Svg icon={user} />} shortcut="Ctrl P">Profile</DropdownItem>
        <DropdownItem icon={<Svg icon={gear} />}>Settings</DropdownItem>
        <DropdownItem icon={<Svg icon={copy} />}>Duplicate</DropdownItem>
        <DropdownItem icon={<Svg icon={pencilSimple} />} disabled>Rename</DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={<Svg icon={trash} />} shortcut="Del" tone="danger">Delete</DropdownItem>
      </DropdownPopup>
    </DropdownRoot>
  )
}
