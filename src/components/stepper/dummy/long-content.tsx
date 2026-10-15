import { Stepper } from '../index.js'

const STEPS = [
  { id: 'one', title: 'Confirm the billing address on the order' },
  { id: 'two', title: 'Choose a delivery slot for the big items' },
  { id: 'three', title: 'Add the gift note and the wrapping paper' },
  { id: 'four', title: 'Review every line of the order, then pay' },
  { id: 'five', title: 'Pay with a saved card or a bank transfer' },
  { id: 'six', title: 'Download the receipt and tracking number' },
]

/** Six steps of forty characters: each title wraps inside its own column and the page never scrolls sideways. */
export default function Demo() {
  return <Stepper items={STEPS} value="three" aria-label="Checkout" />
}
