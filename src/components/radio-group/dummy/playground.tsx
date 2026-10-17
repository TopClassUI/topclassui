import { RadioGroupItem, RadioGroupRoot } from '../index.js'
import type { RadioGroupDesignProps } from '../types.js'

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default. */
export default function Demo(props: RadioGroupDesignProps) {
  return (
    <div className="grid justify-items-start gap-2">
      <span id="radio-group-playground-label" className="text-sm text-body">Billing</span>
      <RadioGroupRoot aria-labelledby="radio-group-playground-label" defaultValue="yearly" {...props}>
        <RadioGroupItem value="monthly">Monthly</RadioGroupItem>
        <RadioGroupItem value="yearly">Yearly</RadioGroupItem>
        <RadioGroupItem value="lifetime">Lifetime</RadioGroupItem>
      </RadioGroupRoot>
    </div>
  )
}
