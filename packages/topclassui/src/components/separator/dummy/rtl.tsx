import { Separator } from '../index.js'

/** Right to left: the vertical line is the inline-start border, the right edge of its box here. */
export default function Demo() {
  return (
    <div dir="rtl" lang="ar" className="flex flex-col gap-4 text-sm text-body">
      <p className="text-base">البيانات الشخصية</p>
      <Separator />
      <div className="flex h-5 items-center gap-3">
        <span>مسودة</span>
        <Separator orientation="vertical" />
        <span>عُدّلت قبل ساعتين</span>
      </div>
    </div>
  )
}
