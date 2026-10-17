import { warning } from '#icons/data/warning.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { Banner } from '../index.js'

/** A phone-wide box: a long action drops to a line of its own, so the message keeps a readable width. */
export default function Demo() {
  return (
    <div className="flex w-full max-w-80 flex-col gap-3">
      <Banner
        tone="warning"
        aria-label="Build minutes notice"
        icon={<Svg icon={warning} size="xs" />}
        action={(
          <Button size="sm" variant="outline" tone="warning" render={<a href="/billing" />}>
            Upgrade the workspace plan and resume deployments now
          </Button>
        )}
      >
        Your workspace has used its monthly build minutes, so new deployments wait until the plan is upgraded.
      </Banner>
      <div dir="rtl" lang="ar">
        <Banner
          tone="info"
          aria-label="إشعار دقائق البناء"
          action={<Button size="sm" variant="outline" tone="info">ترقية خطة مساحة العمل واستئناف النشر الآن</Button>}
        >
          تجاوزت مساحة العمل دقائق البناء الشهرية، لذلك تنتظر عمليات النشر الجديدة حتى تتم ترقية الخطة.
        </Banner>
      </div>
    </div>
  )
}
