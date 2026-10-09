import { Timeline } from '../index.js'

const EVENTS = [
  { id: 'primary', tone: 'primary', title: 'Primary', time: 'A new version is ready.' },
  { id: 'neutral', tone: 'neutral', title: 'Neutral', time: 'Nothing has changed since Monday.' },
  { id: 'success', tone: 'success', title: 'Success', time: 'The invoice was paid.' },
  { id: 'warning', tone: 'warning', title: 'Warning', time: 'The trial ends in three days.' },
  { id: 'danger', tone: 'danger', title: 'Danger', time: 'The last deploy failed.' },
  { id: 'info', tone: 'info', title: 'Info', time: 'Maintenance starts at 22:00.' },
] as const

/** Every tone as a marker, so axe measures all six in each mode. */
export default function Demo() {
  return <Timeline items={EVENTS} getKey={(event) => event.id} />
}
