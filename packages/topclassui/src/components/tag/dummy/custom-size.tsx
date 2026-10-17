import { Tag } from '../index.js'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Tag size="md">The scale</Tag>
      <Tag size="custom" className="px-pad-x-xs py-pad-y-xs text-xs">Your own row</Tag>
    </div>
  )
}
