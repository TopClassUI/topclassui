import { SidebarBody, SidebarHeader } from 'topclassui/sidebar'

import type { Locale } from '../../content/pages'
import type { SiteLabels } from '../../labels/index'
import { SidebarRoot } from './shell-islands'
import { SidebarGroups } from './sidebar-groups'

export interface SiteSidebarProps {
  locale: Locale
  current: string
  labels: SiteLabels
}

/** Sticky under the navbar, its own scroll container; hidden under 64rem, where the menu's drawer carries the groups. */
export function SiteSidebar({ locale, current, labels }: SiteSidebarProps) {
  return (
    <div className="sticky top-(--tc-sticky-top) hidden self-start h-[calc(100dvh-var(--tc-sticky-top))] lg:flex">
      <SidebarRoot aria-label={labels.shell.siteNav} className="h-full overscroll-contain">
        <SidebarHeader>{labels.shell.sidebarTitle}</SidebarHeader>
        <SidebarBody className="overscroll-contain">
          <SidebarGroups locale={locale} current={current} labels={labels} />
        </SidebarBody>
      </SidebarRoot>
    </div>
  )
}
