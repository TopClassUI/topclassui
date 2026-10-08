import { checkCircle } from '#icons/data/check-circle.js'
import { Svg } from '#components/svg/index.js'
import { Badge } from '../index.js'

/** The docs sample: the icon is decoration, the word carries the status. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Badge tone="success" variant="soft">
        <Svg icon={checkCircle} />
        Paid
      </Badge>
      <Badge tone="warning" variant="soft">Pending</Badge>
      <Badge tone="danger" variant="solid">Overdue</Badge>
    </div>
  )
}
