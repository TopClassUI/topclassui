import { info } from '#icons/data/info.js'
import { warning } from '#icons/data/warning.js'
import { x } from '#icons/data/x.js'
import { Svg } from '#components/svg/index.js'
import { cn } from '#shared/cn.js'
import { Banner } from '../index.js'

const CELL = 'grid min-h-14 place-items-center'
const CHIP = 'w-auto flex-nowrap gap-1.5 *:basis-auto rounded-chip px-2.5 py-1.75 font-mono text-xs/tight font-normal'

/** The frame's strip, one equal cell a state, each banner drawn as the frame's small chip naming its tone: primary
 * with no mark, info and warning with their own, and a dismissed banner, which renders nothing at all. */
export default function Demo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
      <div className={CELL}><Banner tone="primary" aria-label="primary" className={CHIP}>primary</Banner></div>
      <div className={CELL}><Banner tone="info" aria-label="info" className={CHIP} icon={<Svg icon={info} size="0.8125rem" />}>info</Banner></div>
      <div className={CELL}><Banner tone="warning" aria-label="warning" className={CHIP} icon={<Svg icon={warning} size="0.8125rem" />}>warning</Banner></div>
      <div role="group" aria-label="dismissed" className={cn(CELL, 'grid-flow-col justify-center gap-1.5 font-mono text-xs text-muted')}>
        <Svg icon={x} size="0.875rem" className="opacity-40" />
        <span aria-hidden className="opacity-40">hidden</span>
      </div>
    </div>
  )
}
