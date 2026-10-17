import { check } from '#icons/data/check.js'
import { clock } from '#icons/data/clock.js'
import { plus } from '#icons/data/plus.js'
import { warning } from '#icons/data/warning.js'
import { Svg } from '#components/svg/index.js'
import { Timeline } from '../index.js'

const EVENTS = [
  { id: 'created', icon: <Svg icon={plus} size="xs" />, title: 'Invoice created', time: '09:12' },
  { id: 'paid', icon: <Svg icon={check} size="xs" />, tone: 'success', title: 'Payment received', time: '11:30' },
  { id: 'late', icon: <Svg icon={warning} size="xs" />, tone: 'warning', title: 'Receipt delayed', time: '11:31' },
  { id: 'sent', icon: <Svg icon={clock} size="xs" />, status: 'todo', title: 'Receipt sent' },
] as const

/** An icon stands in for the dot and takes the tone; the last item has no time. */
export default function Demo() {
  return <Timeline items={EVENTS} getKey={(event) => event.id} />
}
