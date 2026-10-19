import { checkCircle } from '#icons/data/check-circle.js'
import { info } from '#icons/data/info.js'
import { warningCircle } from '#icons/data/warning-circle.js'
import { warning } from '#icons/data/warning.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { Banner } from '../index.js'

const ICON = <Svg icon={info} size="xs" />

/** Every state Banner draws: the six tones, each with its own mark as the frame draws them and primary with none, no
 * icon, an action, and the x of a dismissible one. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <Banner tone="primary" aria-label="Primary">Primary</Banner>
      <Banner tone="neutral" aria-label="Neutral" icon={ICON}>Neutral</Banner>
      <Banner tone="success" aria-label="Success" icon={<Svg icon={checkCircle} size="xs" />}>Success</Banner>
      <Banner tone="warning" aria-label="Warning" icon={<Svg icon={warning} size="xs" />}>Warning</Banner>
      <Banner tone="danger" aria-label="Danger" icon={<Svg icon={warningCircle} size="xs" />}>Danger</Banner>
      <Banner tone="info" aria-label="Info" icon={ICON}>Info</Banner>
      <Banner tone="info" aria-label="No icon">No icon</Banner>
      <Banner
        tone="info"
        aria-label="With action"
        icon={ICON}
        action={<Button size="sm" variant="link" tone="info" className="px-0 font-semibold">Read more</Button>}
      >
        With action
      </Banner>
      <Banner dismissible id="banner-states-dismissible" tone="info" aria-label="Dismissible" icon={ICON}>
        Dismissible
      </Banner>
    </div>
  )
}
