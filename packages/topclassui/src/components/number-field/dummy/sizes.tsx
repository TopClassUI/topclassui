import { NumberField } from '../index.js'

/** The five sizes. Each is as wide as an Input of its size, and every stepper stays 24 px, 44 under a finger. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      <NumberField size="xs" defaultValue={12} aria-label="Extra small" />
      <NumberField size="sm" defaultValue={12} aria-label="Small" />
      <NumberField size="md" defaultValue={12} aria-label="Medium" />
      <NumberField size="lg" defaultValue={12} aria-label="Large" />
      <NumberField size="xl" defaultValue={12} aria-label="Extra large" />
    </div>
  )
}
