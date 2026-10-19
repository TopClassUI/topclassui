import { Icon } from 'topclassui/icon'
import { SidebarBody } from 'topclassui/sidebar'

import type { Locale } from '../../content/pages'
import type { SiteLabels } from '../../labels/index'
import { SidebarRoot } from './shell-islands'
import { SidebarGroups } from './sidebar-groups'

export interface SiteSidebarProps {
  locale: Locale
  current: string
  labels: SiteLabels
}

// The docs frames: the rail on the page colour, its line the full height of the column, rows 28 px apart from 32 (the row knob, 24 px floor kept).
const COLUMN = 'hidden border-e-(length:--tc-line-width) border-line lg:block'
const RAIL = 'h-full border-e-0 bg-page px-2.5 pt-5 pb-6 [--tc-row-height:1.75rem]'
const TITLE = 'flex shrink-0 items-center gap-2 ps-2 pb-2.5 text-sm font-semibold text-body'

/** Sticky under the navbar, its own scroll container; hidden under 64rem, where the menu's drawer carries the groups. */
export function SiteSidebar({ locale, current, labels }: SiteSidebarProps) {
  return (
    <div className={COLUMN}>
      <div className="sticky top-(--tc-sticky-top) flex h-[calc(100dvh-var(--tc-sticky-top))]">
        <SidebarRoot aria-label={labels.shell.siteNav} className={RAIL}>
          <p className={TITLE}><Icon name="book-open" />{labels.shell.sidebarTitle}</p>
          <SidebarBody className="gap-0.5 overscroll-contain">
            <SidebarGroups locale={locale} current={current} labels={labels} />
          </SidebarBody>
        </SidebarRoot>
      </div>
    </div>
  )
}
