import { check } from '#icons/data/check.js'
import { clock } from '#icons/data/clock.js'
import { Svg } from '#components/svg/index.js'
import { Timeline, TimelineSkeleton } from '../index.js'

const DONE = [{ id: 'done', title: 'Done', time: 'A filled dot in success', status: 'done' }] as const
const CURRENT = [{ id: 'current', title: 'Current', time: 'A filled dot in primary, read as the current step', status: 'current' }] as const
const TODO = [{ id: 'todo', title: 'To do', time: 'A ring on the raised surface', status: 'todo' }] as const
const TONED = [{ id: 'toned', title: 'A tone of its own', time: 'No status, the danger tone', tone: 'danger' }] as const
const ICON = [{ id: 'icon', icon: <Svg icon={check} size="xs" />, title: 'An icon', time: 'Takes the tone of its status', status: 'done' }] as const
const ICON_TODO = [{ id: 'icon-todo', icon: <Svg icon={clock} size="xs" />, title: 'An icon to do', status: 'todo' }] as const

/** Every state the rail draws, one rail each so each is named: the three statuses, a tone with no status, an icon filled and
 * hollow, the skeleton while loading, and no items. */
export default function Demo() {
  return (
    <div className="grid gap-4">
      <Timeline items={DONE} getKey={(event) => event.id} />
      <Timeline items={CURRENT} getKey={(event) => event.id} />
      <Timeline items={TODO} getKey={(event) => event.id} />
      <Timeline items={TONED} getKey={(event) => event.id} />
      <Timeline items={ICON} getKey={(event) => event.id} />
      <Timeline items={ICON_TODO} getKey={(event) => event.id} />
      <TimelineSkeleton />
      <Timeline items={[]} getKey={() => 'none'} />
    </div>
  )
}
