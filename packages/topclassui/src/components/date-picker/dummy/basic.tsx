import { DatePicker } from '../index.js'

/** A label that points at the trigger by its id: the server prints the day in the provider's locale, and the form
 * input holds it as an ISO date. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-1.5">
      <label htmlFor="date-picker-basic" className="text-sm text-body">Check-in</label>
      <DatePicker id="date-picker-basic" defaultValue="2026-09-22" />
    </div>
  )
}
