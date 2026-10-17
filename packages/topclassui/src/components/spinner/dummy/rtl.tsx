import { ar } from '#shared/labels/ar.js'
import { Spinner } from '../index.js'

/** The Arabic labels name the first three; the last sits beside its own text, so it is hidden. */
export default function Demo() {
  return (
    <div dir="rtl" lang="ar" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Spinner labels={ar} size="sm" />
        <Spinner labels={ar} />
        <Spinner labels={ar} size="lg" tone="neutral" />
      </div>
      <p className="flex items-center gap-2 text-body">
        <Spinner size="sm" aria-hidden />
        جارٍ تحميل المعاينة
      </p>
    </div>
  )
}
