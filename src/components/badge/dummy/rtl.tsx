import { checkCircle } from '#icons/data/check-circle.js'
import { Svg } from '#components/svg/index.js'
import { Badge } from '../index.js'

export default function Demo() {
  return (
    <div dir="rtl" lang="ar" className="flex flex-wrap items-center gap-2">
      <Badge tone="success">
        <Svg icon={checkCircle} />
        مدفوع
      </Badge>
      <Badge tone="warning">قيد الانتظار</Badge>
      <Badge tone="danger" variant="solid">متأخر</Badge>
      <Badge variant="outline">مسودة</Badge>
    </div>
  )
}
