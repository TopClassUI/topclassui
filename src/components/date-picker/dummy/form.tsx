import { Button } from '#components/button/index.js'
import { DatePicker } from '../index.js'

/** The DatePicker carries the name and the default. It sends checkIn=2026-10-02, before any script runs and after. */
export default function Demo() {
  return (
    <form className="grid justify-items-start gap-3">
      <label htmlFor="date-picker-form" className="text-sm text-body">Check-in</label>
      <DatePicker id="date-picker-form" name="checkIn" defaultValue="2026-10-02" required />
      <Button type="submit">Save</Button>
    </form>
  )
}
