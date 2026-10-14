import { RadioGroupItem, RadioGroupRoot } from '../index.js'

/** The five sizes, one group each, the first radio checked. Each target stays 24 px, and 44 px under a finger. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-4">
      <RadioGroupRoot size="xs" aria-label="Extra small" defaultValue="on" orientation="horizontal">
        <RadioGroupItem value="on">Extra small</RadioGroupItem>
        <RadioGroupItem value="off">Off</RadioGroupItem>
      </RadioGroupRoot>
      <RadioGroupRoot size="sm" aria-label="Small" defaultValue="on" orientation="horizontal">
        <RadioGroupItem value="on">Small</RadioGroupItem>
        <RadioGroupItem value="off">Off</RadioGroupItem>
      </RadioGroupRoot>
      <RadioGroupRoot size="md" aria-label="Medium" defaultValue="on" orientation="horizontal">
        <RadioGroupItem value="on">Medium</RadioGroupItem>
        <RadioGroupItem value="off">Off</RadioGroupItem>
      </RadioGroupRoot>
      <RadioGroupRoot size="lg" aria-label="Large" defaultValue="on" orientation="horizontal">
        <RadioGroupItem value="on">Large</RadioGroupItem>
        <RadioGroupItem value="off">Off</RadioGroupItem>
      </RadioGroupRoot>
      <RadioGroupRoot size="xl" aria-label="Extra large" defaultValue="on" orientation="horizontal">
        <RadioGroupItem value="on">Extra large</RadioGroupItem>
        <RadioGroupItem value="off">Off</RadioGroupItem>
      </RadioGroupRoot>
    </div>
  )
}
