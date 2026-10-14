import { TopClassProvider } from '#shared/provider/provider.js'
import { OTPField } from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it. The group sits at the right, under its label,
 * and its cells still run left to right, as the code reads. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar">
        <label htmlFor="otp-rtl-code" className="block text-sm text-body">رمز التحقق</label>
        <OTPField id="otp-rtl-code" name="code" className="mt-2" />
      </div>
    </TopClassProvider>
  )
}
