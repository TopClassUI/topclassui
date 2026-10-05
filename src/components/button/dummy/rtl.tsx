import { arrowRight } from '#icons/data/arrow-right.js'
import { Svg } from '#components/svg/index.js'
import { Button } from '../index.js'

export default function Demo() {
  return (
    <div dir="rtl" lang="ar" className="flex flex-wrap items-center gap-3">
      <Button>احفظ</Button>
      <Button variant="soft" tone="danger">احذف</Button>
      <Button variant="outline">
        التالي
        <Svg icon={arrowRight} />
      </Button>
    </div>
  )
}
