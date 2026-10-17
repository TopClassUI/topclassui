import { DatePicker } from '../index.js'

/** The states a server can render: nothing chosen shows the placeholder, invalid points at its message, disabled dims. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      <DatePicker aria-label="Nothing chosen" />
      <div className="grid justify-items-start gap-1">
        <DatePicker aria-label="Invalid" invalid aria-describedby="date-picker-states-error" defaultValue="2026-09-22" />
        <span id="date-picker-states-error" className="text-xs text-danger-on-soft">Pick a weekday.</span>
      </div>
      <DatePicker aria-label="Disabled" disabled defaultValue="2026-09-22" />
    </div>
  )
}
