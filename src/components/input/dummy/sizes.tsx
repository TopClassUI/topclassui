import { Input } from '../index.js'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Input size="xs" placeholder="Extra small" aria-label="Extra small" />
      <Input size="sm" placeholder="Small" aria-label="Small" />
      <Input placeholder="Medium" aria-label="Medium" />
      <Input size="lg" placeholder="Large" aria-label="Large" />
      <Input size="xl" placeholder="Extra large" aria-label="Extra large" />
    </div>
  )
}
