import { fileText } from '#icons/data/file-text.js'
import { Svg } from '#components/svg/index.js'
import { SidebarBody, SidebarGroup, SidebarHeader, SidebarLink, SidebarRoot } from '../index.js'

const PAGES = Array.from({ length: 60 }, (_, index) => `Page ${String(index + 1)}`)

/** Sixty links in a rail as tall as the screen: the list scrolls inside the body, under a
 * header that stays put, and the page does not move. The parent gives the rail its height. */
export default function Demo() {
  return (
    <div className="h-[calc(100dvh-4rem)]">
      <SidebarRoot>
        <SidebarHeader>Handbook</SidebarHeader>
        <SidebarBody>
          <SidebarGroup label="Pages">
            {PAGES.map((page, index) => (
              <SidebarLink key={page} href={`#page-${String(index + 1)}`} icon={<Svg icon={fileText} />} current={index === 0}>
                {page}
              </SidebarLink>
            ))}
          </SidebarGroup>
        </SidebarBody>
      </SidebarRoot>
    </div>
  )
}
