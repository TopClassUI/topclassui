import { warning } from '#icons/data/warning.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { Banner } from '../index.js'

/** The action is a Button in the banner's own tone: a link through render, or a button. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <Banner
        tone="warning"
        aria-label="Trial notice"
        icon={<Svg icon={warning} size="xs" />}
        action={<Button size="sm" tone="warning" render={<a href="#" />}>Add a payment method</Button>}
      >
        Your trial ends in three days.
      </Banner>
      <Banner
        tone="danger"
        aria-label="Payment notice"
        action={<Button size="sm" variant="outline" tone="danger">Retry the payment</Button>}
      >
        The last payment failed, so deploys are paused.
      </Banner>
      <Banner
        aria-labelledby="banner-plan-message"
        action={<Button size="sm" variant="outline" render={<a href="#" />}>Compare plans</Button>}
      >
        <span id="banner-plan-message">A new plan is available.</span>
      </Banner>
    </div>
  )
}
