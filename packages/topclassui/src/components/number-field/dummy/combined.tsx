import { NumberField } from '../index.js'

/** The states a server can render, the fields the keyboard and layout specs drive: empty with a placeholder, invalid, disabled, read-only, and at its limit with + dimmed. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      <NumberField placeholder="0" aria-label="Empty" />
      <NumberField invalid defaultValue={12} aria-label="Invalid" />
      <NumberField disabled defaultValue={12} aria-label="Disabled" />
      <NumberField readOnly defaultValue={12} aria-label="Read-only" />
      <NumberField max={99} defaultValue={99} aria-label="At the limit" />
    </div>
  )
}
