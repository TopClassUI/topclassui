import { RadioGroupItem, RadioGroupRoot } from '../index.js'

/** The stage the frame draws: three choices with no visible heading, the group named by its aria-label. */
export default function Demo() {
  return (
    <RadioGroupRoot aria-label="Billing" defaultValue="yearly">
      <RadioGroupItem value="monthly">Monthly</RadioGroupItem>
      <RadioGroupItem value="yearly">Yearly</RadioGroupItem>
      <RadioGroupItem value="lifetime">Lifetime</RadioGroupItem>
    </RadioGroupRoot>
  )
}
