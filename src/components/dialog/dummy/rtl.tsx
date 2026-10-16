import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import {
  DialogBody, DialogClose, DialogDescription, DialogFooter, DialogHeader, DialogPopup, DialogRoot, DialogTitle,
  DialogTrigger,
} from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it. The popup is portaled
 * into the body, so it takes its direction and its language from the provider: the x is on
 * the left, the text is right-aligned and the actions end at the left, on an English page too. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar">
        <DialogRoot>
          <DialogTrigger render={<Button>نشر</Button>} />
          <DialogPopup>
            <DialogHeader>
              <DialogTitle>نشر التغييرات</DialogTitle>
              <DialogDescription>تظهر تغييراتك للجميع فورًا.</DialogDescription>
            </DialogHeader>
            <DialogBody>تغيّر 11 ملفًا منذ آخر نشر.</DialogBody>
            <DialogFooter>
              <DialogClose render={<Button variant="outline">إلغاء</Button>} />
              <DialogClose render={<Button>انشر الآن</Button>} />
            </DialogFooter>
          </DialogPopup>
        </DialogRoot>
      </div>
    </TopClassProvider>
  )
}
