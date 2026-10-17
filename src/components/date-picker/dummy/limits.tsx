import { DatePicker } from '../index.js'

/** The card's dates: a day from 25 September 2026 to 31 March 2027. The days outside are dimmed and cannot be chosen,
 * and the previous button stops at September. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-1.5">
      <label htmlFor="date-picker-limits" className="text-sm text-body">Check-in</label>
      <DatePicker id="date-picker-limits" name="checkIn" defaultValue="2026-10-02" minDate="2026-09-25" maxDate="2027-03-31" />
    </div>
  )
}
