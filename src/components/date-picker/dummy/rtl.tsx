import { TopClassProvider } from '#shared/provider/provider.js'
import { DatePicker } from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it: Arabic month names, the week from Saturday,
 * the icon at the right, the calendar lined up with the right edge of the trigger, and ArrowLeft the next day. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar" className="grid justify-items-start gap-1.5">
        <label htmlFor="date-picker-rtl" className="text-sm text-body">تاريخ الوصول</label>
        <DatePicker id="date-picker-rtl" name="checkIn" defaultValue="2026-09-22" />
      </div>
    </TopClassProvider>
  )
}
