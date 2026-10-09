import { Input } from '../index.js'

export default function Demo() {
  return (
    <div dir="rtl" lang="ar" className="grid max-w-sm gap-3">
      <label htmlFor="demo-name-ar" className="text-sm font-medium text-body">الاسم</label>
      <Input id="demo-name-ar" fullWidth placeholder="اكتب اسمك" />
      <Input type="email" fullWidth defaultValue="omar@example.com" aria-label="البريد الإلكتروني" />
      <Input invalid fullWidth defaultValue="٠٧٩" aria-label="رقم الهاتف" />
    </div>
  )
}
