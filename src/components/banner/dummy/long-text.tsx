import { Button } from '#components/button/index.js'
import { Banner } from '../index.js'

const LOG_URL = 'https://example.com/projects/topclassui/deployments/2026-10-09/logs/build-step-four-of-six.txt'

/** Two narrow boxes: the long message wraps above its action, and the unbroken URL breaks anywhere. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="w-64">
        <Banner
          tone="warning"
          aria-label="Long notice"
          action={<Button size="sm" variant="outline" tone="warning" render={<a href="/status" />}>Status</Button>}
        >
          The deploy is taking longer than usual while the static assets upload to the edge network.
        </Banner>
      </div>
      <div className="w-64">
        <Banner tone="danger" aria-label="Log address">{LOG_URL}</Banner>
      </div>
    </div>
  )
}
