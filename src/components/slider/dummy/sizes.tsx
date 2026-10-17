import { Slider } from '../index.js'

/** The five sizes. Each is as wide as an Input of its size, and each thumb stays 24 px, and 44 px under a finger. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-4">
      <Slider size="xs" aria-label="Extra small" defaultValue={20} />
      <Slider size="sm" aria-label="Small" defaultValue={40} />
      <Slider size="md" aria-label="Medium" defaultValue={50} />
      <Slider size="lg" aria-label="Large" defaultValue={60} />
      <Slider size="xl" aria-label="Extra large" defaultValue={80} />
    </div>
  )
}
