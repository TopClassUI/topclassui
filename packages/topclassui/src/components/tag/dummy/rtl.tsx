import { checkCircle } from '#icons/data/check-circle.js'
import { Svg } from '#components/svg/index.js'
import { Tag } from '../index.js'

export default function Demo() {
  return (
    <div dir="rtl" lang="ar" className="flex flex-wrap items-center gap-2">
      <Tag tone="success">
        <Svg icon={checkCircle} />
        موثّق
      </Tag>
      <Tag>تصميم</Tag>
      <Tag tone="info">إمكانية الوصول</Tag>
      <Tag tone="danger">عاجل</Tag>
    </div>
  )
}
