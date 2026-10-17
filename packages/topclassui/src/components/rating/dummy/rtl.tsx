import { getLabels } from '#shared/labels/get-labels.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { Rating } from '../index.js'

const arabic = getLabels('ar')

/** Arabic, inside TopClassProvider as the root layout would mount it. The first star is at the
 * right, and half a star fills its right half. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar" className="flex flex-col items-start gap-3">
        <Rating value={3.5} {...arabic} />
        <h2 id="rating-rtl-title" className="text-sm font-medium">قيّم هذه الدورة</h2>
        <Rating readOnly={false} defaultValue={2} aria-labelledby="rating-rtl-title" {...arabic} />
      </div>
    </TopClassProvider>
  )
}
