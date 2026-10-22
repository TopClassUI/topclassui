import { magnifyingGlass } from '#icons/data/magnifying-glass.js'
import { warningCircle } from '#icons/data/warning-circle.js'
import { Svg } from '#components/svg/index.js'
import { EmptyState } from '../index.js'

/** Every state the strip draws, one cell each, captioned by its name: default, filtered, error and compact, each an
 * icon over the frame's word. A group role, so the caption is a name the element may carry. */
export default function Demo() {
  return (
    <div className="grid items-start gap-6">
      <EmptyState role="group" aria-label="default" title="empty" />
      <EmptyState role="group" aria-label="filtered" icon={<Svg icon={magnifyingGlass} size="xl" className="text-muted" />} title="no matches" />
      <EmptyState role="group" aria-label="error" icon={<Svg icon={warningCircle} size="xl" className="text-danger-on-soft" />} title="failed" />
      <EmptyState role="group" aria-label="compact" compact title="empty" />
    </div>
  )
}
