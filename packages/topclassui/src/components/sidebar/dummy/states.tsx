import { folder } from '#icons/data/folder.js'
import { gear } from '#icons/data/gear.js'
import { house } from '#icons/data/house.js'
import { users } from '#icons/data/users.js'
import { Svg } from '#components/svg/index.js'
import { SidebarBody, SidebarGroup, SidebarHeader, SidebarLink, SidebarRoot } from '../index.js'

/** The ring a focused link wears, drawn at rest so the strip can show it; not under forced colours, where a ring at
 * rest would read as focus. */
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** One rail of the frame as a card, Home the page being read; `hover` and `ring` draw a pointer on Projects and the focus
 * on Home. Its aria-label is the prop the strip reads to caption the cell. */
function Rail({ 'aria-label': label, open = true, hover = false, ring = false }: { 'aria-label': string, open?: boolean, hover?: boolean, ring?: boolean }) {
  return (
    // 160 px open, narrower than the drawn 220, so five rails fit five cells of the strip; the card is the caller's className.
    <SidebarRoot aria-label={label} defaultOpen={open} className="data-open:w-40 rounded-box border-(length:--tc-line-width)">
      <SidebarHeader>Workspace</SidebarHeader>
      <SidebarBody>
        <SidebarGroup>
          <SidebarLink href="#home" icon={<Svg icon={house} />} current className={ring ? RING : undefined}>Home</SidebarLink>
          <SidebarLink href="#projects" icon={<Svg icon={folder} />} className={hover ? 'bg-surface' : undefined}>Projects</SidebarLink>
          <SidebarLink href="#team" icon={<Svg icon={users} />}>Team</SidebarLink>
          <SidebarLink href="#settings" icon={<Svg icon={gear} />}>Settings</SidebarLink>
        </SidebarGroup>
      </SidebarBody>
    </SidebarRoot>
  )
}

/** The five states the frame draws, one rail each as tall as its links, named by its state: expanded, collapsed, the
 * page being read, a link under the pointer and a link with the focus ring. Each rail passes its own aria-label. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <Rail aria-label="expanded" />
      <Rail aria-label="collapsed" open={false} />
      <Rail aria-label="active item" />
      <Rail aria-label="hover" hover />
      <Rail aria-label="focus-visible" ring />
    </div>
  )
}
