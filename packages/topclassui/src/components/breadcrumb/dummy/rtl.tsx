import { ar } from '#shared/labels/ar.js'
import { Breadcrumb } from '../index.js'

/** The Arabic labels name the nav, and the caret is flipped so it points along the trail. */
export default function Demo() {
  return (
    <div dir="rtl" lang="ar">
      <Breadcrumb
        labels={ar}
        items={[
          { href: '/', label: 'الرئيسية' },
          { href: '#docs', label: 'التوثيق' },
          { label: 'مسار التنقل' },
        ]}
      />
    </div>
  )
}
