import { magnifyingGlass } from '#icons/data/magnifying-glass.js'
import { Svg } from '#components/svg/index.js'
import { Button } from '#components/button/index.js'
import { EmptyState } from '../index.js'

/** The filtered cell: another icon and title, not a variant, and a Clear filters button. */
export default function Demo() {
  return (
    <div className="max-w-85">
      <EmptyState
        icon={<Svg icon={magnifyingGlass} size="xl" className="text-muted" />}
        title="No matches"
        description="Nothing matches that search. Try fewer words, or clear the filters."
      >
        <Button size="sm" variant="outline">Clear filters</Button>
      </EmptyState>
    </div>
  )
}
