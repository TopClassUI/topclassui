import { folder } from '#icons/data/folder.js'
import { gear } from '#icons/data/gear.js'
import { house } from '#icons/data/house.js'
import { users } from '#icons/data/users.js'
import { Svg } from '#components/svg/index.js'
import { SidebarBody, SidebarGroup, SidebarHeader, SidebarLink, SidebarRoot } from '../index.js'

/** The stage Figma 138:2539 draws: a 190 px rail as a card as tall as its links, Home the page being read. The card look
 * and the width are the caller's className; a side rail of a layout keeps the library's square edge and 220 px. */
export default function Demo() {
  return (
    <SidebarRoot className="h-auto rounded-box border-(length:--tc-line-width) data-open:w-47.5">
      <SidebarHeader>Workspace</SidebarHeader>
      <SidebarBody>
        <SidebarGroup>
          <SidebarLink href="#home" icon={<Svg icon={house} />} current>Home</SidebarLink>
          <SidebarLink href="#projects" icon={<Svg icon={folder} />}>Projects</SidebarLink>
          <SidebarLink href="#team" icon={<Svg icon={users} />}>Team</SidebarLink>
          <SidebarLink href="#settings" icon={<Svg icon={gear} />}>Settings</SidebarLink>
        </SidebarGroup>
      </SidebarBody>
    </SidebarRoot>
  )
}
