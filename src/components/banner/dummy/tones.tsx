import { info } from '#icons/data/info.js'
import { Svg } from '#components/svg/index.js'
import { Banner } from '../index.js'

const ICON = <Svg icon={info} size="xs" />

/** All six tones, each a landmark with a name of its own. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <Banner tone="primary" aria-label="Primary banner" icon={ICON}>A new plan is available.</Banner>
      <Banner tone="neutral" aria-label="Neutral banner" icon={ICON}>You are viewing an archived project.</Banner>
      <Banner tone="success" aria-label="Success banner" icon={ICON}>Your domain is verified.</Banner>
      <Banner tone="warning" aria-label="Warning banner" icon={ICON}>Your trial ends in three days.</Banner>
      <Banner tone="danger" aria-label="Danger banner" icon={ICON}>The last payment failed.</Banner>
      <Banner tone="info" aria-label="Info banner" icon={ICON}>Version 2 is out.</Banner>
    </div>
  )
}
