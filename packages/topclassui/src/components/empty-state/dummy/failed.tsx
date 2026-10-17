import { warningCircle } from '#icons/data/warning-circle.js'
import { Svg } from '#components/svg/index.js'
import { Button } from '#components/button/index.js'
import { EmptyState } from '../index.js'

/** The error cell: the warning icon in the danger colour, and a Try again button. */
export default function Demo() {
  return (
    <div className="max-w-85">
      <EmptyState
        icon={<Svg icon={warningCircle} size="xl" className="text-danger-on-soft" />}
        title="The invoices did not load"
        description="Check your connection, then try again."
      >
        <Button size="sm" variant="outline">Try again</Button>
      </EmptyState>
    </div>
  )
}
