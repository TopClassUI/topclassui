import { Button } from '#components/button/index.js'
import { Alert } from '../index.js'

/** The drawn RTL alert, soft success, then a warning with actions and an outline danger, each icon at the start. */
export default function Demo() {
  return (
    <div dir="rtl" lang="ar" className="flex flex-col gap-3">
      <Alert tone="success" title="تم الدفع">
        وصلت الدفعة وأُرسل الإيصال إلى بريدك.
      </Alert>
      <Alert
        tone="warning"
        title="تنتهي الفترة التجريبية بعد ثلاثة أيام"
        actions={(
          <>
            <Button size="sm" tone="warning">أضف وسيلة دفع</Button>
            <Button size="sm" variant="outline" tone="warning">ذكّرني لاحقاً</Button>
          </>
        )}
      >
        تتوقف عمليات النشر عندها، وتبقى المشاريع قابلة للقراءة.
      </Alert>
      <Alert variant="outline" tone="danger" title="فشل النشر الأخير">
        يعرض الموقع النسخة السابقة.
      </Alert>
    </div>
  )
}
