import { Timeline } from '../index.js'

const EVENTS = [
  { id: 'created', title: 'Project created', time: '2 October, 09:12', status: 'done' },
  { id: 'deployed', title: 'First deploy', time: '4 October, 16:40', status: 'done' },
  { id: 'review', title: 'In review', time: 'Today', status: 'current' },
  { id: 'launch', title: 'Launch', time: 'Not scheduled', status: 'todo' },
] as const

/** The drawn rail: done in success, the current step in primary, and a hollow todo. */
export default function Demo() {
  return <Timeline items={EVENTS} getKey={(event) => event.id} />
}
