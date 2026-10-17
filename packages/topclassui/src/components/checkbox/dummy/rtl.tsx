import { TopClassProvider } from '#shared/provider/provider.js'
import { Checkbox } from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it. The box sits at the right, before its label. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar" className="grid justify-items-start gap-3">
        <div className="flex items-center gap-2">
          <Checkbox id="checkbox-rtl-terms" name="terms" defaultChecked />
          <label htmlFor="checkbox-rtl-terms" className="text-sm text-body">أوافق على الشروط</label>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox id="checkbox-rtl-news" name="news" />
          <label htmlFor="checkbox-rtl-news" className="text-sm text-body">أرسل لي أخبار المنتج</label>
        </div>
      </div>
    </TopClassProvider>
  )
}
