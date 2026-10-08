import { Kbd } from '../index.js'

export default function Demo() {
  return (
    <div dir="rtl" lang="ar" className="flex flex-col gap-3 text-sm text-body">
      <p>اضغط <Kbd>Ctrl</Kbd> <Kbd>K</Kbd> لفتح لوحة الأوامر.</p>
      <p>اضغط <Kbd>Shift</Kbd> <Kbd>Tab</Kbd> للرجوع إلى العنصر السابق.</p>
    </div>
  )
}
