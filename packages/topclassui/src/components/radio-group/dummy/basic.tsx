import { RadioGroupItem, RadioGroupRoot } from '../index.js'

/** Outside a Field: the group is named by the visible text above it, and each radio by its own text. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-2">
      <span id="radio-group-basic-label" className="text-sm text-body">Billing</span>
      <RadioGroupRoot aria-labelledby="radio-group-basic-label" defaultValue="yearly">
        <RadioGroupItem value="monthly">Monthly</RadioGroupItem>
        <RadioGroupItem value="yearly">Yearly</RadioGroupItem>
        <RadioGroupItem value="lifetime">Lifetime</RadioGroupItem>
      </RadioGroupRoot>
    </div>
  )
}
