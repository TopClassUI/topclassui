import { Badge } from '../index.js'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge size="md">The scale</Badge>
      <Badge size="custom" className="px-pad-x-xs py-pad-y-xs text-xs">Your own row</Badge>
    </div>
  )
}
