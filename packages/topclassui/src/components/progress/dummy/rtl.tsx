import { Progress } from '../index.js'

/** The bar grows from the right, the inline start, with no class of its own for it. */
export default function Demo() {
  return (
    <div dir="rtl" lang="ar" className="grid max-w-sm gap-4">
      <div className="grid gap-1">
        <span id="upload-ar" className="text-sm">رفع الملف</span>
        <Progress value={60} aria-labelledby="upload-ar" />
      </div>
      <Progress value={30} tone="success" aria-label="النسخ الاحتياطي" />
      <Progress indeterminate aria-label="جارٍ التحميل" />
    </div>
  )
}
