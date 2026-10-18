import { Stepper } from '../index.js'

const STEPS = [
  { id: 'cart', title: 'Cart' },
  { id: 'address', title: 'Address' },
  { id: 'payment', title: 'Payment' },
] as const

const FAILED = [
  { id: 'cart', title: 'Cart' },
  { id: 'address', title: 'Address', status: 'error' },
  { id: 'payment', title: 'Payment' },
] as const

const FINISHED = [
  { id: 'cart', title: 'Cart' },
  { id: 'address', title: 'Address' },
  { id: 'payment', title: 'Payment', status: 'done' },
] as const

/** A task at its start, in its middle, stopped by an error and finished: every status a circle can draw. */
export default function Demo() {
  return (
    <div className="grid gap-8">
      <Stepper items={STEPS} value="cart" aria-label="Not started" />
      <Stepper items={STEPS} value="address" aria-label="In progress" />
      <Stepper items={FAILED} value="address" aria-label="Needs attention" />
      <Stepper items={FINISHED} value="payment" aria-label="Finished" />
    </div>
  )
}
