import { Tag } from '../index.js'
import { TagSkeleton } from '../skeleton.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

/** Each skeleton on one row with the tag it stands in for, so a height mismatch shows. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      {SIZES.map((size) => (
        <div key={size} data-pair={size} className="flex items-center gap-3">
          <Tag size={size}>Design</Tag>
          <TagSkeleton size={size} />
        </div>
      ))}
    </div>
  )
}
