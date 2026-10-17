import { folder } from '#icons/data/folder.js'
import { gear } from '#icons/data/gear.js'
import { house } from '#icons/data/house.js'
import { users } from '#icons/data/users.js'
import { Svg } from '#components/svg/index.js'
import { SidebarBody, SidebarGroup, SidebarHeader, SidebarLink, SidebarRoot, SidebarSkeleton } from '../index.js'

/** The drawn rail above the skeleton that holds its place, each in a wrapper of its own height: the same box. */
export default function Demo() {
  return (
    <div data-pair="open" className="grid gap-2">
      <div>
        <SidebarRoot>
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
      <div><SidebarSkeleton /></div>
    </div>
  )
}
