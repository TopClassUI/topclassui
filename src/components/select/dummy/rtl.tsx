import { TopClassProvider } from '#shared/provider/provider.js'
import { Select } from '../index.js'

const COUNTRIES = [
  { value: 'jo', label: 'الأردن' },
  { value: 'eg', label: 'مصر' },
  { value: 'ma', label: 'المغرب' },
  { value: 'sa', label: 'السعودية' },
]

/** Arabic, inside TopClassProvider as the root layout would mount it. The caret and the tick sit at the left, and
 * bottom-start lines the list up with the right edge of the trigger. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar" className="grid justify-items-start gap-1.5">
        <label htmlFor="select-rtl" className="text-sm text-body">الدولة</label>
        <Select id="select-rtl" name="country" items={COUNTRIES} defaultValue="jo" />
      </div>
    </TopClassProvider>
  )
}
