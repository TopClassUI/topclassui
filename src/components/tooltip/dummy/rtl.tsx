import { linkSimple } from '#icons/data/link-simple.js'
import { trash } from '#icons/data/trash.js'
import { TopClassProvider } from '#shared/provider/provider.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'

/** Arabic, inside TopClassProvider as the root layout would mount it: Base UI mirrors
 * start and end from the provider, so start opens on the right and end on the left. */
export default function Demo() {
  return (
    <TopClassProvider direction="rtl" locale="ar">
      <div dir="rtl" lang="ar" className="flex flex-wrap items-center gap-3">
        <TooltipRoot>
          <TooltipTrigger
            render={
              <Button variant="ghost" aria-label="نسخ الرابط">
                <Svg icon={linkSimple} />
              </Button>
            }
          />
          <TooltipPopup placement="start">نسخ الرابط</TooltipPopup>
        </TooltipRoot>
        <TooltipRoot>
          <TooltipTrigger
            render={
              <Button variant="ghost" aria-label="حذف هذا الصف">
                <Svg icon={trash} />
              </Button>
            }
          />
          <TooltipPopup placement="end">حذف هذا الصف</TooltipPopup>
        </TooltipRoot>
      </div>
    </TopClassProvider>
  )
}
