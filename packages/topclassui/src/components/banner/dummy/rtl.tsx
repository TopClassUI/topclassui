import { bell } from '#icons/data/bell.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { Banner } from '../index.js'

/** Right to left: the icon at the start and the action at the end, with no physical class to mirror. */
export default function Demo() {
  return (
    <div dir="rtl" lang="ar" className="flex flex-col gap-3">
      <Banner
        tone="info"
        aria-label="إعلان الإصدار"
        icon={<Svg icon={bell} size="xs" />}
        action={<Button size="sm" variant="outline" tone="info" render={<a href="/changelog" />}>اقرأ المزيد</Button>}
      >
        صدر الإصدار الثاني، مع بناء أسرع ومحرر جديد للسمات.
      </Banner>
      <Banner tone="warning" aria-label="تنبيه الفترة التجريبية">
        تنتهي الفترة التجريبية بعد ثلاثة أيام.
      </Banner>
    </div>
  )
}
