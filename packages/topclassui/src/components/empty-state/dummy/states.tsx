import { magnifyingGlass } from '#icons/data/magnifying-glass.js'
import { warningCircle } from '#icons/data/warning-circle.js'
import { Svg } from '#components/svg/index.js'
import { Button } from '#components/button/index.js'
import { EmptyState } from '../index.js'

/** Every state the strip draws, one cell each, captioned by its name: default, filtered, error and compact. A group
 * role, so the caption is a name the element may carry. */
export default function Demo() {
  return (
    <div className="grid items-start gap-6 sm:grid-cols-2">
      <EmptyState role="group" aria-label="default" />
      <EmptyState
        role="group"
        aria-label="filtered"
        icon={<Svg icon={magnifyingGlass} size="xl" className="text-muted" />}
        title="No matches"
        description="Nothing matches that search."
      >
        <Button size="sm" variant="outline">Clear filters</Button>
      </EmptyState>
      <EmptyState
        role="group"
        aria-label="error"
        icon={<Svg icon={warningCircle} size="xl" className="text-danger-on-soft" />}
        title="Failed"
        description="Check your connection, then try again."
      >
        <Button size="sm" variant="outline">Try again</Button>
      </EmptyState>
      <EmptyState role="group" aria-label="compact" compact />
    </div>
  )
}
