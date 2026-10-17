import { Timeline, TimelineSkeleton } from '../index.js'

const EVENTS = [
  { id: 'created', title: 'Project created', time: '2 October, 09:12', status: 'done' },
  { id: 'deployed', title: 'First deploy', time: '4 October, 16:40', status: 'done' },
  { id: 'review', title: 'In review', time: 'Today', status: 'current' },
] as const

/** Each timeline beside the skeleton that holds its place, in a wrapper each: the same height. */
export default function Demo() {
  return (
    <div className="grid gap-8">
      {[1, 3].map((rows) => (
        <div key={rows} data-pair={`rows-${String(rows)}`} className="grid grid-cols-2 items-start gap-6">
          <Timeline items={EVENTS.slice(0, rows)} getKey={(event) => event.id} />
          <TimelineSkeleton rows={rows} />
        </div>
      ))}
    </div>
  )
}
