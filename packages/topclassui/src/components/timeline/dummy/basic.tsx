import { Timeline } from '../index.js'

const EVENTS = [
  {
    id: 'created', title: 'Project created', status: 'done',
    time: <time dateTime="2026-10-02T09:12">2 October, 09:12</time>,
  },
  {
    id: 'deployed', title: 'First deploy', status: 'done',
    time: <time dateTime="2026-10-04T16:40">4 October, 16:40</time>,
  },
  { id: 'review', title: 'In review', time: 'Today', status: 'current' },
  { id: 'launch', title: 'Launch', time: 'Not scheduled', status: 'todo' },
] as const

/** The drawn rail: done filled in success, the current step a dot in a ring, and a hollow todo.
 * A `<time>` gives a date a machine can read; each status is also said in hidden text. */
export default function Demo() {
  return <Timeline items={EVENTS} getKey={(event) => event.id} />
}
