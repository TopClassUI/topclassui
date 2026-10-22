import { checkCircle } from '#icons/data/check-circle.js'
import { info } from '#icons/data/info.js'
import { warning } from '#icons/data/warning.js'
import { warningCircle } from '#icons/data/warning-circle.js'
import { Svg } from '#components/svg/index.js'
import { Alert } from '../index.js'

const CELL = 'grid min-h-14 place-items-center'
// The frame's small alert: 142 by 31 px, a 14 px icon and a 12 px title.
const SMALL = 'w-35.5 px-2.25 py-1.75 **:text-xs/tight'

/** The frame's strip, one equal cell a tone, each alert the same width and with its own icon so the message reads
 * without colour. The variants and the slots left out have demos of their own. */
export default function Demo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
      <div role="group" aria-label="info" className={CELL}><Alert tone="info" title="Saved" className={SMALL} icon={<Svg icon={info} size="0.875rem" />} /></div>
      <div role="group" aria-label="success" className={CELL}><Alert tone="success" title="Saved" className={SMALL} icon={<Svg icon={checkCircle} size="0.875rem" />} /></div>
      <div role="group" aria-label="warning" className={CELL}><Alert tone="warning" title="Saved" className={SMALL} icon={<Svg icon={warning} size="0.875rem" />} /></div>
      <div role="group" aria-label="danger" className={CELL}><Alert tone="danger" title="Saved" className={SMALL} icon={<Svg icon={warningCircle} size="0.875rem" />} /></div>
    </div>
  )
}
