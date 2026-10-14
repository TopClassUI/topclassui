import { gear } from '#icons/data/gear.js'
import { trash } from '#icons/data/trash.js'
import { user } from '#icons/data/user.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { DropdownItem, DropdownPopup, DropdownRoot, DropdownSeparator, DropdownTrigger } from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it. The menu is portaled into
 * the body, so it takes its direction and its language from the provider: bottom-start lines up
 * the right edges, the icon is at the right and the shortcut at the left, on an English page too. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar" className="flex flex-wrap items-center gap-3">
        <DropdownRoot>
          <DropdownTrigger render={<Button variant="outline">الإجراءات</Button>} />
          <DropdownPopup>
            <DropdownItem icon={<Svg icon={user} />} shortcut="Ctrl P">الملف الشخصي</DropdownItem>
            <DropdownItem icon={<Svg icon={gear} />}>الإعدادات</DropdownItem>
            <DropdownSeparator />
            <DropdownItem icon={<Svg icon={trash} />} tone="danger">حذف</DropdownItem>
          </DropdownPopup>
        </DropdownRoot>
        <DropdownRoot>
          <DropdownTrigger render={<Button variant="outline">المزيد</Button>} />
          <DropdownPopup placement="end-top">
            <DropdownItem>نسخ الرابط</DropdownItem>
            <DropdownItem>إعادة التسمية</DropdownItem>
          </DropdownPopup>
        </DropdownRoot>
      </div>
    </TopClassProvider>
  )
}
