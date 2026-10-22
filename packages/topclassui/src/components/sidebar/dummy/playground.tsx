import { folder } from '#icons/data/folder.js'
import { gear } from '#icons/data/gear.js'
import { house } from '#icons/data/house.js'
import { users } from '#icons/data/users.js'
import { Svg } from '#components/svg/index.js'
import type { SidebarDesignProps } from '../types.js'
import { SidebarBody, SidebarGroup, SidebarHeader, SidebarLink, SidebarRoot } from '../index.js'

/** The rail the docs' Try it drives: defaultOpen and open go to the root, and current marks Home, as the frame's stage
 * draws it until the reader turns it off. No parent height: the rail is as tall as its four links. */
export default function Demo({ current = true, ...props }: SidebarDesignProps = {}) {
  return (
    <SidebarRoot {...props}>
      <SidebarHeader>Workspace</SidebarHeader>
      <SidebarBody>
        <SidebarGroup>
          <SidebarLink href="#home" icon={<Svg icon={house} />} current={current}>Home</SidebarLink>
          <SidebarLink href="#projects" icon={<Svg icon={folder} />}>Projects</SidebarLink>
          <SidebarLink href="#team" icon={<Svg icon={users} />}>Team</SidebarLink>
          <SidebarLink href="#settings" icon={<Svg icon={gear} />}>Settings</SidebarLink>
        </SidebarGroup>
      </SidebarBody>
    </SidebarRoot>
  )
}
