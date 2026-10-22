import { Timeline } from '../index.js'

const EVENTS = [
  { id: 'created', title: 'Project created', time: '22 Sep, 00:14', status: 'done' },
  { id: 'invited', title: 'Invited three teammates', time: '22 Sep, 00:31', status: 'current' },
  { id: 'deploy', title: 'First deploy', time: 'pending', status: 'todo' },
] as const

/** The docs card's stage as the frame draws it: one event done, one current, one still to come. */
export default function Demo() {
  return <Timeline items={EVENTS} getKey={(event) => event.id} />
}
