import { Stepper } from '../index.js'

const STEPS = [
  { id: 'cart', title: 'Cart' },
  { id: 'address', title: 'Address' },
  { id: 'payment', title: 'Payment' },
]

/** Circles of 24, 28, 32, 40 and 48 px; the connector stays level with the centres at each. */
export default function Demo() {
  return (
    <div className="grid gap-8">
      <Stepper size="xs" items={STEPS} value="address" aria-label="Extra small" />
      <Stepper size="sm" items={STEPS} value="address" aria-label="Small" />
      <Stepper size="md" items={STEPS} value="address" aria-label="Medium" />
      <Stepper size="lg" items={STEPS} value="address" aria-label="Large" />
      <Stepper size="xl" items={STEPS} value="address" aria-label="Extra large" />
    </div>
  )
}
