import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerDescription, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle,
  DrawerTrigger,
} from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it. The sheet is portaled into
 * the body, so it takes its direction and its language from the provider: start opens from the
 * right and end from the left, and each closes by a swipe toward its own edge, on an English page too. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar" className="flex flex-wrap items-center gap-3">
        <DrawerRoot placement="start">
          <DrawerTrigger render={<Button variant="ghost">القائمة</Button>} />
          <DrawerPopup>
            <DrawerHeader>
              <DrawerTitle>تصفّح</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>الوثائق والمكوّنات وسجل التغييرات.</DrawerBody>
          </DrawerPopup>
        </DrawerRoot>
        <DrawerRoot>
          <DrawerTrigger render={<Button variant="outline">التصفية</Button>} />
          <DrawerPopup>
            <DrawerHeader>
              <DrawerTitle>عوامل التصفية</DrawerTitle>
              <DrawerDescription>حدّد المشاريع التي تريد عرضها.</DrawerDescription>
            </DrawerHeader>
            <DrawerBody>الحالة والمالك وتاريخ التحديث.</DrawerBody>
            <DrawerFooter>
              <DrawerClose render={<Button variant="outline">إعادة ضبط</Button>} />
              <DrawerClose render={<Button>تطبيق</Button>} />
            </DrawerFooter>
          </DrawerPopup>
        </DrawerRoot>
      </div>
    </TopClassProvider>
  )
}
