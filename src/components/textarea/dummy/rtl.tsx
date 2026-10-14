import { TopClassProvider } from '#shared/provider/provider.js'
import { Textarea } from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it, with Arabic-Indic digits: the
 * counter sits at the inline end, on the left, and its two numbers keep their order. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar" numberingSystem="arab">
      <div dir="rtl" lang="ar" className="grid max-w-sm gap-3">
        <label htmlFor="textarea-rtl-bio" className="text-sm font-medium text-body">نبذة عنك</label>
        <Textarea id="textarea-rtl-bio" name="bio" fullWidth showCount maxLength={500} defaultValue="مرحبا بكم في TopClass UI" />
        <Textarea name="note" fullWidth dir="auto" placeholder="اكتب ملاحظتك" aria-label="ملاحظة" />
      </div>
    </TopClassProvider>
  )
}
