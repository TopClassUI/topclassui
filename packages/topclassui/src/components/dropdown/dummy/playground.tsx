import { copy } from '#icons/data/copy.js'
import { gear } from '#icons/data/gear.js'
import { trash } from '#icons/data/trash.js'
import { user } from '#icons/data/user.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { DropdownItem, DropdownPopup, DropdownRoot, DropdownSeparator, DropdownTrigger } from '../index.js'
import type { DropdownDesignProps } from '../types.js'

/** The docs stage: the basic menu, with the schema's props passed through, so the Try it controls
 * drive it. tone colours the last row; the delays only apply with openOnHover, and a press still opens it. */
export default function Demo({ placement, tone, delay, closeDelay }: DropdownDesignProps = {}) {
  return (
    <DropdownRoot>
      <DropdownTrigger openOnHover delay={delay} closeDelay={closeDelay} render={<Button variant="outline">Actions</Button>} />
      <DropdownPopup placement={placement}>
        <DropdownItem icon={<Svg icon={user} />} shortcut="Ctrl P">Profile</DropdownItem>
        <DropdownItem icon={<Svg icon={gear} />}>Settings</DropdownItem>
        <DropdownItem icon={<Svg icon={copy} />}>Duplicate</DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={<Svg icon={trash} />} tone={tone}>Delete</DropdownItem>
      </DropdownPopup>
    </DropdownRoot>
  )
}
