import { checkCircle } from '#icons/data/check-circle.js'
import { Svg } from '#components/svg/index.js'
import { Tag } from '../index.js'

const LONG = 'Infrastructure, platform reliability and developer experience working group'

export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-50 rounded-box border border-line p-2" data-narrow>
        <Tag>{LONG}</Tag>
      </div>
      <div className="w-50 rounded-box border border-line p-2" data-narrow>
        <Tag tone="warning">
          <Svg icon={checkCircle} />
          {LONG}
        </Tag>
      </div>
      <div className="w-50 rounded-box border border-line p-2" data-narrow>
        <Tag tone="info" size="xs">{LONG}</Tag>
      </div>
      <div className="flex w-50 gap-2 rounded-box border border-line p-2" data-narrow>
        <Tag className="shrink">{LONG}</Tag>
        <Tag className="shrink" tone="success">{LONG}</Tag>
      </div>
    </div>
  )
}
