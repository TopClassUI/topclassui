import { TopClassProvider } from '#shared/provider/provider.js'
import { SegmentedControlItem, SegmentedControlRoot } from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it. The first segment is at the right, and
 * ArrowRight goes to the segment before. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar" className="grid justify-items-start gap-2">
        <span id="segmented-control-rtl-label" className="text-sm text-body">طريقة العرض</span>
        <SegmentedControlRoot aria-labelledby="segmented-control-rtl-label" name="view" defaultValue="table">
          <SegmentedControlItem value="board">لوحة</SegmentedControlItem>
          <SegmentedControlItem value="table">جدول</SegmentedControlItem>
          <SegmentedControlItem value="calendar">تقويم</SegmentedControlItem>
        </SegmentedControlRoot>
      </div>
    </TopClassProvider>
  )
}
