import { NumberField } from '../index.js'

/** A value at its max, so the increase stepper is disabled and dimmed; and a step of 0.5, which a decimal needs. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      <NumberField name="seats" defaultValue={8} min={1} max={8} aria-label="Seats" />
      <NumberField name="hours" defaultValue={1.5} min={0} max={12} step={0.5} aria-label="Hours" />
    </div>
  )
}
