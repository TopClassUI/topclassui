import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import {
  PopoverClose, PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger,
} from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it. The popup is portaled
 * into the body, so it takes its direction and its language from the provider: start opens on
 * the right, end on the left, bottom-start lines up the right edges, on an English page too. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar" className="flex flex-wrap items-center gap-3">
        <PopoverRoot>
          <PopoverTrigger render={<Button variant="outline">مشاركة</Button>} />
          <PopoverPopup placement="start">
            <div className="flex items-start justify-between gap-2">
              <PopoverTitle>مشاركة هذه الصفحة</PopoverTitle>
              <PopoverClose />
            </div>
            <PopoverDescription>يمكن لأي شخص لديه الرابط قراءتها. فريقك فقط يستطيع التعديل.</PopoverDescription>
          </PopoverPopup>
        </PopoverRoot>
        <PopoverRoot>
          <PopoverTrigger render={<Button variant="outline">التفاصيل</Button>} />
          <PopoverPopup placement="end">
            <PopoverTitle>كيف تعمل الفوترة</PopoverTitle>
            <PopoverDescription>تُحتسب المقاعد المستخدمة فقط.</PopoverDescription>
          </PopoverPopup>
        </PopoverRoot>
        <PopoverRoot>
          <PopoverTrigger render={<Button variant="outline">الإعدادات</Button>} />
          <PopoverPopup placement="bottom-start">
            <PopoverTitle>إعدادات الإشعارات</PopoverTitle>
            <PopoverDescription>يصلك ملخص واحد كل صباح.</PopoverDescription>
          </PopoverPopup>
        </PopoverRoot>
      </div>
    </TopClassProvider>
  )
}
