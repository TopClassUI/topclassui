import { magnifyingGlass } from '#icons/data/magnifying-glass.js'
import { tray } from '#icons/data/tray.js'
import { warningCircle } from '#icons/data/warning-circle.js'
import { Svg } from '#components/svg/index.js'
import { EmptyState } from '../index.js'

/** The frame's word under each icon: mono, muted and small. */
const word = (text: string) => <span className="font-mono text-xs font-normal text-muted">{text}</span>

/** Every state the strip draws, one cell each, captioned by its name: default, filtered, error and compact, each a
 * 24 px icon over the frame's word, bare on the card. A group role, so the caption is a name the element may carry. */
export default function Demo() {
  return (
    <div className="grid items-start gap-6">
      <EmptyState role="group" aria-label="default" bordered={false} icon={<Svg icon={tray} size="md" className="text-muted" />} title={word('empty')} />
      <EmptyState role="group" aria-label="filtered" bordered={false} icon={<Svg icon={magnifyingGlass} size="md" className="text-muted" />} title={word('no matches')} />
      <EmptyState role="group" aria-label="error" bordered={false} icon={<Svg icon={warningCircle} size="md" className="text-danger-on-soft" />} title={word('failed')} />
      <EmptyState role="group" aria-label="compact" bordered={false} compact title={word('empty')} />
    </div>
  )
}
