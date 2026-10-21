import { RadioGroupItem, RadioGroupRoot } from '../index.js'

/** The states a server can render, combined with checked, the groups the keyboard and layout specs drive. A read-only group looks like a live one, and its aria-readonly is not announced. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-4">
      <RadioGroupRoot aria-label="Invalid" invalid defaultValue="yes" orientation="horizontal">
        <RadioGroupItem value="yes">Invalid, checked</RadioGroupItem>
        <RadioGroupItem value="no">Invalid</RadioGroupItem>
      </RadioGroupRoot>
      <RadioGroupRoot aria-label="Disabled" disabled defaultValue="yes" orientation="horizontal">
        <RadioGroupItem value="yes">Disabled, checked</RadioGroupItem>
        <RadioGroupItem value="no">Disabled</RadioGroupItem>
      </RadioGroupRoot>
      <RadioGroupRoot aria-label="One disabled" defaultValue="yes" orientation="horizontal">
        <RadioGroupItem value="yes">Live, checked</RadioGroupItem>
        <RadioGroupItem value="no" disabled>One disabled</RadioGroupItem>
        <RadioGroupItem value="maybe">Live</RadioGroupItem>
      </RadioGroupRoot>
      <RadioGroupRoot aria-label="Read-only" readOnly defaultValue="yes" orientation="horizontal">
        <RadioGroupItem value="yes">Read-only, checked</RadioGroupItem>
        <RadioGroupItem value="no">Read-only</RadioGroupItem>
      </RadioGroupRoot>
    </div>
  )
}
