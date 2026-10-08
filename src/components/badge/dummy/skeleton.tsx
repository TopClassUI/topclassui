import { Badge } from '../index.js'
import { BadgeSkeleton } from '../skeleton.js'

/** Each skeleton on one row with the badge it stands in for, so a height mismatch shows. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <BadgeSkeleton size="sm" />
        <Badge size="sm">Small</Badge>
      </div>
      <div className="flex items-center gap-3">
        <BadgeSkeleton />
        <Badge>Medium</Badge>
      </div>
      <div className="flex items-center gap-3">
        <BadgeSkeleton size="lg" />
        <Badge size="lg">Large</Badge>
      </div>
    </div>
  )
}
