'use client'

import { Button } from '#components/button/index.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { toast } from '../index.js'

/** Arabic inside TopClassProvider. The one viewport is the outermost provider's: on an Arabic page the toast sits
 * at the bottom left, and from an Arabic island on an English page it shows in the page's own corner and language. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar">
        <Button
          variant="outline"
          onClick={() => { toast.add({ tone: 'success', title: 'تم إرسال الدعوة', description: 'تصلهم رسالة خلال دقيقة.' }) }}
        >
          دعوة
        </Button>
      </div>
    </TopClassProvider>
  )
}
