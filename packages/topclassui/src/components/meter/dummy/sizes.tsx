import { Meter } from '../index.js'

/** The track height follows padding-y: 2, 4, 6, 8 and 10 px at density 1. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-4">
      <Meter size="xs" value={60} aria-label="Extra small" />
      <Meter size="sm" value={60} aria-label="Small" />
      <Meter size="md" value={60} aria-label="Medium" />
      <Meter size="lg" value={60} aria-label="Large" />
      <Meter size="xl" value={60} aria-label="Extra large" />
    </div>
  )
}
