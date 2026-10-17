import { folder } from '#icons/data/folder.js'
import { gear } from '#icons/data/gear.js'
import { house } from '#icons/data/house.js'
import { users } from '#icons/data/users.js'
import { Svg } from '#components/svg/index.js'
import { SidebarBody, SidebarGroup, SidebarHeader, SidebarLink, SidebarRoot } from '../index.js'

/** Collapsed from the start: the server sends the 60 px column of icons, so nothing moves
 * when the page hydrates. Each label is hidden and still names its link. */
export default function Demo() {
  return (
    <div className="h-96">
      <SidebarRoot defaultOpen={false}>
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
    </div>
  )
}
