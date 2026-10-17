import { TopClassProvider } from '#shared/provider/provider.js'
import { Combobox } from '../index.js'

const CITIES = [
  { value: 'amman', label: 'عمّان' },
  { value: 'irbid', label: 'إربد' },
  { value: 'zarqa', label: 'الزرقاء' },
  { value: 'aqaba', label: 'العقبة' },
  { value: 'madaba', label: 'مادبا' },
]

/** Arabic, inside TopClassProvider as the root layout would mount it. The caret sits at the left, the list opens at
 * the right edge of the input, and the tick ends each row at its left. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar" className="grid justify-items-start gap-1">
        <label htmlFor="combobox-rtl" className="text-sm font-medium text-body">المدينة</label>
        <Combobox id="combobox-rtl" name="city" items={CITIES} defaultValue="amman" />
      </div>
    </TopClassProvider>
  )
}
