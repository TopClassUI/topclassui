import { Checkbox } from '#components/checkbox/index.js'
import { Input } from '#components/input/index.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { Field } from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it: the asterisk follows the label, and an inline box sits at the right. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar" className="grid max-w-sm gap-4">
        <Field name="email" label="البريد الإلكتروني" hint="لن نشاركه مع أحد" error="هذا البريد مستخدم" required>
          {(control) => <Input {...control} type="email" defaultValue="omar@example.com" fullWidth />}
        </Field>
        <Field name="terms" label="أوافق على الشروط" hint="اقرأها قبل المتابعة" inline>
          {(control) => <Checkbox {...control} />}
        </Field>
      </div>
    </TopClassProvider>
  )
}
