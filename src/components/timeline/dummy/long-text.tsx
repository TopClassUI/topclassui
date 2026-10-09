import { Timeline } from '../index.js'

const LOG_URL = 'https://example.com/projects/topclassui/deployments/2026-10-09/logs/build-step-four-of-six.txt'

const EVENTS = [
  {
    id: 'failed',
    tone: 'danger',
    title: 'The deploy failed while uploading the static assets to the edge network',
    time: 'Friday 9 October 2026 at 16:40, Central European Summer Time',
  },
  { id: 'log', title: LOG_URL, time: 'Kept for thirty days' },
  { id: 'retry', status: 'todo', title: 'Retry' },
] as const

/** A narrow box: a long title wraps, the unbroken URL breaks anywhere, and the connector grows with both. */
export default function Demo() {
  return (
    <div className="w-64">
      <Timeline items={EVENTS} getKey={(event) => event.id} />
    </div>
  )
}
