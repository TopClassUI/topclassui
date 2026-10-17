import { Button } from '#components/button/index.js'
import { CardBody, CardFooter, CardHeader, CardRoot } from '../index.js'

export default function Demo() {
  return (
    <div dir="rtl" lang="ar" className="max-w-xs">
      <CardRoot>
        <CardHeader>
          <h2>التقرير الشهري</h2>
        </CardHeader>
        <CardBody>ارتفعت الإيرادات 12% مقارنة بشهر أبريل، بفضل التجديدات.</CardBody>
        <CardFooter>
          <Button size="sm">اقرأ المزيد</Button>
          <Button size="sm" variant="outline" tone="neutral">لاحقًا</Button>
        </CardFooter>
      </CardRoot>
    </div>
  )
}
