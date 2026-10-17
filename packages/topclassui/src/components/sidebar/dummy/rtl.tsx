import { folder } from '#icons/data/folder.js'
import { gear } from '#icons/data/gear.js'
import { house } from '#icons/data/house.js'
import { users } from '#icons/data/users.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { Svg } from '#components/svg/index.js'
import { SidebarBody, SidebarGroup, SidebarHeader, SidebarLink, SidebarRoot } from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it. The rail's line is on
 * its left, the toggle at its right with its icon mirrored, and both are named in Arabic. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar" className="h-96">
        <SidebarRoot>
          <SidebarHeader>مساحة العمل</SidebarHeader>
          <SidebarBody>
            <SidebarGroup label="التنقل">
              <SidebarLink href="#home" icon={<Svg icon={house} />} current>الرئيسية</SidebarLink>
              <SidebarLink href="#projects" icon={<Svg icon={folder} />}>المشاريع</SidebarLink>
              <SidebarLink href="#team" icon={<Svg icon={users} />}>الفريق</SidebarLink>
              <SidebarLink href="#settings" icon={<Svg icon={gear} />}>الإعدادات</SidebarLink>
            </SidebarGroup>
          </SidebarBody>
        </SidebarRoot>
      </div>
    </TopClassProvider>
  )
}
