import { magnifyingGlass } from '#icons/data/magnifying-glass.js'
import { warningCircle } from '#icons/data/warning-circle.js'
import { Svg } from '#components/svg/index.js'
import { Button } from '#components/button/index.js'
import { EmptyState } from '../index.js'

/** Every state EmptyState draws: the defaults, a title alone, an action, the error and the filtered cell, and the compact form. */
export default function Demo() {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      <EmptyState />
      <EmptyState icon={null} title="Title only" />
      <EmptyState title="With action" description="The action is the caller's own Button.">
        <Button size="sm">New project</Button>
      </EmptyState>
      <EmptyState
        icon={<Svg icon={warningCircle} size="xl" className="text-danger-on-soft" />}
        title="Failed"
        description="Check your connection, then try again."
      >
        <Button size="sm" variant="outline">Try again</Button>
      </EmptyState>
      <EmptyState
        icon={<Svg icon={magnifyingGlass} size="xl" className="text-muted" />}
        title="Filtered"
        description="Nothing matches that search."
      >
        <Button size="sm" variant="outline">Clear filters</Button>
      </EmptyState>
      <EmptyState compact title="Compact" description="The tight form, for a panel or a list cell." />
    </div>
  )
}
