import { Progress } from '../index.js'

export default function Demo() {
  return (
    <div className="grid max-w-sm gap-4">
      <Progress size="xs" value={60} aria-label="Extra small" />
      <Progress size="sm" value={60} aria-label="Small" />
      <Progress size="md" value={60} aria-label="Medium" />
      <Progress size="lg" value={60} aria-label="Large" />
      <Progress size="xl" value={60} aria-label="Extra large" />
    </div>
  )
}
