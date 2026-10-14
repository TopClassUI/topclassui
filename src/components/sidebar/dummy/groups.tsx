import { bell } from '#icons/data/bell.js'
import { folder } from '#icons/data/folder.js'
import { gear } from '#icons/data/gear.js'
import { house } from '#icons/data/house.js'
import { signOut } from '#icons/data/sign-out.js'
import { users } from '#icons/data/users.js'
import { Svg } from '#components/svg/index.js'
import { SidebarBody, SidebarGroup, SidebarHeader, SidebarLink, SidebarRoot } from '../index.js'

/** Two groups, each a list named by its label. Collapsed, the labels are hidden and a
 * screen reader still hears "Workspace, list" and "Account, list". */
export default function Demo() {
  return (
    <div className="h-112">
      <SidebarRoot>
        <SidebarHeader>Acme</SidebarHeader>
        <SidebarBody>
          <SidebarGroup label="Workspace">
            <SidebarLink href="#home" icon={<Svg icon={house} />}>Home</SidebarLink>
            <SidebarLink href="#projects" icon={<Svg icon={folder} />} current>Projects</SidebarLink>
            <SidebarLink href="#team" icon={<Svg icon={users} />}>Team</SidebarLink>
          </SidebarGroup>
          <SidebarGroup label="Account">
            <SidebarLink href="#notifications" icon={<Svg icon={bell} />}>Notifications</SidebarLink>
            <SidebarLink href="#settings" icon={<Svg icon={gear} />}>Settings</SidebarLink>
            <SidebarLink href="#sign-out" icon={<Svg icon={signOut} />}>Sign out</SidebarLink>
          </SidebarGroup>
        </SidebarBody>
      </SidebarRoot>
    </div>
  )
}
