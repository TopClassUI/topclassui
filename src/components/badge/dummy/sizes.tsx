import { Badge } from '../index.js'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge size="xs">Extra small</Badge>
      <Badge size="sm">Small</Badge>
      <Badge size="md">Medium</Badge>
      <Badge size="lg">Large</Badge>
      <Badge size="xl">Extra large</Badge>
    </div>
  )
}
