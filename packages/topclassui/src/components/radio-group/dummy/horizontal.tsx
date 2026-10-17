import { RadioGroupItem, RadioGroupRoot } from '../index.js'

/** orientation="horizontal" lays the radios in a row that wraps on a narrow screen. The arrow keys are the same. */
export default function Demo() {
  return (
    <RadioGroupRoot aria-label="Size" orientation="horizontal" defaultValue="m">
      <RadioGroupItem value="s">Small</RadioGroupItem>
      <RadioGroupItem value="m">Medium</RadioGroupItem>
      <RadioGroupItem value="l">Large</RadioGroupItem>
      <RadioGroupItem value="xl">Extra large</RadioGroupItem>
    </RadioGroupRoot>
  )
}
