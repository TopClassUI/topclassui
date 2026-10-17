import { TopClassProvider } from '#shared/provider/provider.js'
import { Slider } from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it. The track runs from right to left: 30 sits 30%
 * in from the right, ArrowLeft raises the value, and the two thumbs of the range are named in Arabic. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar" className="grid justify-items-start gap-3">
        <span id="slider-rtl-volume" className="text-sm text-body">مستوى الصوت</span>
        <Slider aria-labelledby="slider-rtl-volume" name="volume" defaultValue={30} showValue />
        <span id="slider-rtl-price" className="text-sm text-body">نطاق السعر</span>
        <Slider aria-labelledby="slider-rtl-price" name="price" defaultValue={[20, 80]} />
      </div>
    </TopClassProvider>
  )
}
