import Link from 'next/link'
import { Icon } from 'topclassui/icon'
import { SidebarGroup, SidebarLink } from 'topclassui/sidebar'

import { LIVE_PAGES, PAGE_GROUPS, hrefOf, type Locale } from '../../content/pages'
import type { SiteLabels } from '../../labels/index'

export interface SidebarGroupsProps {
  locale: Locale
  current: string
  labels: SiteLabels
}

/** The registry's live pages, one group each, in sidebar order: the rail and the phone menu draw the same list. */
export function SidebarGroups({ locale, current, labels }: SidebarGroupsProps) {
  return PAGE_GROUPS.map((group) => {
    const pages = LIVE_PAGES.filter((page) => page.group === group)
    if (pages.length === 0) return null
    return (
      <SidebarGroup key={group} label={<span className="uppercase">{labels.shell.groups[group]}</span>} className="pt-2">
        {pages.map((page) => (
          <SidebarLink
            key={page.slug}
            render={<Link href={hrefOf(page, locale)} />}
            icon={<Icon name={page.icon} />}
            current={page.slug === current}
            className="px-2"
          >
            {page.title[locale]}
          </SidebarLink>
        ))}
      </SidebarGroup>
    )
  })
}
