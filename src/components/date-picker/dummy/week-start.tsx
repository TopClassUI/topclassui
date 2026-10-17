import { TopClassProvider } from '#shared/provider/provider.js'
import { DatePicker } from '../index.js'

/** The first column: Monday, then Saturday, then left to the locale, which for British English is Monday too. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      <DatePicker aria-label="Monday first" firstDayOfWeek={1} defaultValue="2026-09-22" />
      <DatePicker aria-label="Saturday first" firstDayOfWeek={6} defaultValue="2026-09-22" />
      <TopClassProvider direction="ltr" locale="en-GB">
        <DatePicker aria-label="The locale's first day" defaultValue="2026-09-22" />
      </TopClassProvider>
    </div>
  )
}
