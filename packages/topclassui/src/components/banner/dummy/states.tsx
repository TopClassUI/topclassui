import { info } from '#icons/data/info.js'
import { warning } from '#icons/data/warning.js'
import { x } from '#icons/data/x.js'
import { Svg } from '#components/svg/index.js'
import { Banner } from '../index.js'

/** The frame's strip, one cell a state: primary with no mark, info and warning with their own, and a dismissed banner,
 * which renders nothing at all. The x itself is in the dismissible demo. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-6">
      <Banner tone="primary" aria-label="primary">A new version is ready.</Banner>
      <Banner tone="info" aria-label="info" icon={<Svg icon={info} size="xs" />}>Maintenance starts at 22:00.</Banner>
      <Banner tone="warning" aria-label="warning" icon={<Svg icon={warning} size="xs" />}>Your trial ends in three days.</Banner>
      <div role="group" aria-label="dismissed" className="flex items-center gap-1.5 text-xs text-muted">
        <Svg icon={x} size="xs" />
        Dismissed: nothing renders, on this page and every later one.
      </div>
    </div>
  )
}
