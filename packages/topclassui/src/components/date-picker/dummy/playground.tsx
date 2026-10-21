import { DatePicker } from '../index.js'
import type { DatePickerDesignProps } from '../types.js'

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default. */
export default function Demo(props: DatePickerDesignProps) {
  return (
    <div className="grid justify-items-start gap-1.5">
      <label htmlFor="date-picker-playground" className="text-sm text-body">Check-in</label>
      <DatePicker id="date-picker-playground" defaultValue="2026-09-22" firstDayOfWeek={1} {...props} />
    </div>
  )
}
