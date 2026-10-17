import { getLabels } from '#shared/labels/get-labels.js'
import { Stepper } from '../index.js'

const STEPS = [
  { id: 'cart', title: 'السلة' },
  { id: 'address', title: 'العنوان' },
  { id: 'payment', title: 'الدفع' },
  { id: 'confirm', title: 'التأكيد' },
]

/** The locale decides the digits: ar-u-nu-arab writes Arabic-Indic numbers, plain ar Latin ones. */
export default function Demo() {
  return (
    <div dir="rtl" lang="ar" className="grid gap-8">
      <Stepper items={STEPS} value="payment" aria-label="أرقام عربية هندية" {...getLabels('ar-u-nu-arab')} />
      <Stepper items={STEPS} value="payment" aria-label="أرقام لاتينية" {...getLabels('ar')} />
    </div>
  )
}
