import { getLabels } from '#shared/labels/get-labels.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { Stepper } from '../index.js'

const STEPS = [
  { id: 'account', title: 'الحساب' },
  { id: 'profile', title: 'الملف الشخصي' },
  { id: 'team', title: 'الفريق' },
  { id: 'done', title: 'تم' },
]

/** Arabic, inside TopClassProvider as the root layout would mount it. The first step is at
 * the right and each connector runs leftward, with no class of its own for it. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar">
        <Stepper items={STEPS} value="profile" aria-label="التسجيل" {...getLabels('ar')} />
      </div>
    </TopClassProvider>
  )
}
