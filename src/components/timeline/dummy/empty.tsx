import { Timeline, type TimelineItem } from '../index.js'

const NONE: readonly (TimelineItem & { id: string })[] = []

/** No items: the fallback takes the place of the list, and without one nothing renders. */
export default function Demo() {
  return (
    <Timeline
      items={NONE}
      getKey={(event) => event.id}
      emptyFallback={<p className="text-sm text-muted">No activity yet.</p>}
    />
  )
}
