import { TopClassProvider } from '#shared/provider/provider.js'
import { RadioGroupItem, RadioGroupRoot } from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it. Each circle sits at the right, before its text,
 * and ArrowRight goes to the radio before. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar" className="grid justify-items-start gap-2">
        <span id="radio-group-rtl-label" className="text-sm text-body">الفوترة</span>
        <RadioGroupRoot aria-labelledby="radio-group-rtl-label" name="billing" defaultValue="yearly">
          <RadioGroupItem value="monthly">شهريًا</RadioGroupItem>
          <RadioGroupItem value="yearly">سنويًا</RadioGroupItem>
          <RadioGroupItem value="lifetime">مدى الحياة</RadioGroupItem>
        </RadioGroupRoot>
      </div>
    </TopClassProvider>
  )
}
