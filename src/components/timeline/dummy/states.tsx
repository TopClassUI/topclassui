import { check } from '#icons/data/check.js'
import { clock } from '#icons/data/clock.js'
import { Svg } from '#components/svg/index.js'
import { Timeline } from '../index.js'

const EVENTS = [
  { id: 'done', title: 'Done', time: 'A filled dot in success', status: 'done' },
  { id: 'current', title: 'Current', time: 'A dot in a ring, read as the current step', status: 'current' },
  { id: 'todo', title: 'To do', time: 'A hollow dot', status: 'todo' },
  { id: 'toned', title: 'A tone of its own', time: 'No status, the danger tone', tone: 'danger' },
  { id: 'icon', icon: <Svg icon={check} size="xs" />, title: 'An icon', time: 'Takes the tone of its status', status: 'done' },
  { id: 'icon-todo', icon: <Svg icon={clock} size="xs" />, title: 'An icon to do', status: 'todo' },
] as const

/** Every marker the rail draws: the three statuses, a tone with no status, and an icon filled and hollow. */
export default function Demo() {
  return <Timeline items={EVENTS} getKey={(event) => event.id} />
}
