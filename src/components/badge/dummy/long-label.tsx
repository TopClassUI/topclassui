import { checkCircle } from '#icons/data/check-circle.js'
import { Svg } from '#components/svg/index.js'
import { Badge } from '../index.js'

const LONG = 'Awaiting a second approval from the finance team before release'

export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-50 rounded-box border border-line p-2" data-narrow>
        <Badge>{LONG}</Badge>
      </div>
      <div className="w-50 rounded-box border border-line p-2" data-narrow>
        <Badge variant="outline" tone="warning">
          <Svg icon={checkCircle} />
          {LONG}
        </Badge>
      </div>
      <div className="w-50 rounded-box border border-line p-2" data-narrow>
        <Badge variant="solid" size="xs">{LONG}</Badge>
      </div>
    </div>
  )
}
