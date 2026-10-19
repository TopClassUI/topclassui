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

const LOCKED = [
  { id: 'cart', title: 'Cart' },
  { id: 'address', title: 'Address' },
  { id: 'payment', title: 'Payment', disabled: true },
] as const

/** A task at its start, in its middle, stopped by an error, finished, and with a step not reachable yet. */
export default function Demo() {
  return (
    <div className="grid gap-8">
      <Stepper items={STEPS} value="cart" aria-label="Not started" />
      <Stepper items={STEPS} value="address" aria-label="In progress" />
      <Stepper items={FAILED} value="address" aria-label="Needs attention" />
      <Stepper items={FINISHED} value="payment" aria-label="Finished" />
      <Stepper items={LOCKED} value="cart" aria-label="Payment not reachable yet" />
    </div>
  )
}
