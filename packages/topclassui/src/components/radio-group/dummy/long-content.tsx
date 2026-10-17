import { RadioGroupItem, RadioGroupRoot } from '../index.js'

/** A choice is read whole: a long text wraps under itself, and a word longer than the line breaks anywhere. */
export default function Demo() {
  return (
    <RadioGroupRoot aria-label="Delivery" defaultValue="standard">
      <RadioGroupItem value="standard">
        Standard delivery, three to five working days, left with a neighbour or at the nearest pick-up point if nobody is home
      </RadioGroupItem>
      <RadioGroupItem value="link">
        https://example.com/delivery/options/express-next-day-before-noon-with-signature-and-tracking
      </RadioGroupItem>
      <RadioGroupItem value="short">Pick up</RadioGroupItem>
    </RadioGroupRoot>
  )
}
