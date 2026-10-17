import { TopClassProvider } from '#shared/provider/provider.js'
import { Switch } from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it. The thumb starts at the right and
 * slides to the left when the switch is on. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar" className="grid justify-items-start gap-3">
        <div className="flex items-center gap-2">
          <Switch id="switch-rtl-digest" name="digest" defaultChecked />
          <label htmlFor="switch-rtl-digest" className="text-sm text-body">الملخص الأسبوعي</label>
        </div>
        <div className="flex items-center gap-2">
          <Switch id="switch-rtl-mentions" name="mentions" />
          <label htmlFor="switch-rtl-mentions" className="text-sm text-body">راسلني عند الإشارة إليّ</label>
        </div>
      </div>
    </TopClassProvider>
  )
}
