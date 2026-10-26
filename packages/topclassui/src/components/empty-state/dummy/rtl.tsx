import { plus } from '#icons/data/plus.js'
import { ar } from '#shared/labels/ar.js'
import { Svg } from '#components/svg/index.js'
import { Button } from '#components/button/index.js'
import { EmptyState } from '../index.js'

/** The Arabic labels give the default title and description; the action is the caller's. */
export default function Demo() {
  return (
    <div dir="rtl" lang="ar" className="max-w-85">
      <EmptyState labels={ar}>
        <Button size="sm" render={<a href="#" />}>
          <Svg icon={plus} />
          مشروع جديد
        </Button>
      </EmptyState>
    </div>
  )
}
