import { checkCircle } from '#icons/data/check-circle.js'
import { Svg } from '#components/svg/index.js'
import { Tag } from '../index.js'

const LONG = 'Infrastructure, platform reliability and developer experience working group'
const DIGEST = 'sha256_9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08'

/** An element as the label is clipped to the chip on one line; only bare text gets the ellipsis. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-50 rounded-box border border-line p-2" data-narrow>
        <Tag><strong>{LONG}</strong></Tag>
      </div>
      <div className="w-50 rounded-box border border-line p-2" data-narrow>
        <Tag tone="warning">
          <Svg icon={checkCircle} />
          <em>{LONG}</em>
        </Tag>
      </div>
      <div className="w-50 rounded-box border border-line p-2" data-narrow>
        <Tag tone="info" size="xs"><code>{DIGEST}</code></Tag>
      </div>
    </div>
  )
}
