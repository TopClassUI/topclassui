import { folder } from '#icons/data/folder.js'
import { trash } from '#icons/data/trash.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { DropdownItem, DropdownPopup, DropdownRoot, DropdownSeparator, DropdownTrigger } from '../index.js'

/** A destructive row. tone="danger" only colours it, and a reader who cannot see red gets no
 * colour: the label says what it does, an icon repeats it, and a line sets it apart. */
export default function Demo() {
  return (
    <DropdownRoot>
      <DropdownTrigger render={<Button variant="outline">Project</Button>} />
      <DropdownPopup>
        <DropdownItem icon={<Svg icon={folder} />}>Move to archive</DropdownItem>
        <DropdownSeparator />
        <DropdownItem icon={<Svg icon={trash} />} tone="danger">Delete project</DropdownItem>
      </DropdownPopup>
    </DropdownRoot>
  )
}
