import { TopClassProvider } from '#shared/provider/provider.js'
import { NumberField } from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it. Increase is at the left, the number stays
 * left-to-right; the first writes Latin digits, as the provider does, the second Arabic-Indic ones from its locale. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar" className="grid justify-items-start gap-2">
        <label htmlFor="number-field-rtl-change" className="text-sm text-body">الفرق</label>
        <NumberField id="number-field-rtl-change" name="change" defaultValue={-5} min={-10} max={10} />
        <label htmlFor="number-field-rtl-guests" className="text-sm text-body">عدد الضيوف</label>
        <NumberField id="number-field-rtl-guests" name="guests" locale="ar-u-nu-arab" defaultValue={1234.5} step="any" />
      </div>
    </TopClassProvider>
  )
}
