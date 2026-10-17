import { NumberField } from '../index.js'

/** The states a server can render: empty with a placeholder, invalid, disabled and read-only. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      <NumberField placeholder="0" aria-label="Empty" />
      <NumberField invalid defaultValue={12} aria-label="Invalid" />
      <NumberField disabled defaultValue={12} aria-label="Disabled" />
      <NumberField readOnly defaultValue={12} aria-label="Read-only" />
    </div>
  )
}
