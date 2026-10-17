import { folder } from '#icons/data/folder.js'
import { gear } from '#icons/data/gear.js'
import { house } from '#icons/data/house.js'
import { Svg } from '#components/svg/index.js'
import type { SidebarDesignProps } from '../types.js'
import { SidebarBody, SidebarGroup, SidebarHeader, SidebarLink, SidebarRoot } from '../index.js'

/** The rail the docs' Try it drives: defaultOpen and open go to the root, and current marks Home. */
export default function Demo({ defaultOpen, open, current }: SidebarDesignProps = {}) {
  return (
    <div className="h-96">
      <SidebarRoot defaultOpen={defaultOpen} open={open}>
        <SidebarHeader>Workspace</SidebarHeader>
        <SidebarBody>
          <SidebarGroup>
            <SidebarLink href="#home" icon={<Svg icon={house} />} current={current}>Home</SidebarLink>
            <SidebarLink href="#projects" icon={<Svg icon={folder} />}>Projects</SidebarLink>
            <SidebarLink href="#settings" icon={<Svg icon={gear} />}>Settings</SidebarLink>
          </SidebarGroup>
        </SidebarBody>
      </SidebarRoot>
    </div>
  )
}
