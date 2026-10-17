import { folder } from '#icons/data/folder.js'
import { gear } from '#icons/data/gear.js'
import { house } from '#icons/data/house.js'
import { Svg } from '#components/svg/index.js'
import { SidebarBody, SidebarGroup, SidebarHeader, SidebarLink, SidebarRoot } from '../index.js'

/** The states a server can render: expanded and collapsed, each with the page being read
 * marked. Two rails on one page need a name each, so both pass their own aria-label. */
export default function Demo() {
  return (
    <div className="flex h-96 flex-wrap gap-6">
      <SidebarRoot aria-label="Expanded">
        <SidebarHeader>Workspace</SidebarHeader>
        <SidebarBody>
          <SidebarGroup>
            <SidebarLink href="#home" icon={<Svg icon={house} />} current>Home</SidebarLink>
            <SidebarLink href="#projects" icon={<Svg icon={folder} />}>Projects</SidebarLink>
            <SidebarLink href="#settings" icon={<Svg icon={gear} />}>Settings</SidebarLink>
          </SidebarGroup>
        </SidebarBody>
      </SidebarRoot>
      <SidebarRoot aria-label="Collapsed" defaultOpen={false}>
        <SidebarHeader>Workspace</SidebarHeader>
        <SidebarBody>
          <SidebarGroup>
            <SidebarLink href="#home" icon={<Svg icon={house} />}>Home</SidebarLink>
            <SidebarLink href="#projects" icon={<Svg icon={folder} />} current>Projects</SidebarLink>
            <SidebarLink href="#settings" icon={<Svg icon={gear} />}>Settings</SidebarLink>
          </SidebarGroup>
        </SidebarBody>
      </SidebarRoot>
    </div>
  )
}
