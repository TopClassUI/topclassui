import { checkCircle } from '#icons/data/check-circle.js'
import { Svg } from '#components/svg/index.js'
import { Tag } from '../index.js'

/** The icon is decoration, in its own flex slot; the word carries the meaning. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Tag tone="success">
        <Svg icon={checkCircle} />
        Verified
      </Tag>
      <Tag>Draft</Tag>
    </div>
  )
}
