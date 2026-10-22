import type { ReactNode } from 'react'

import { checkCircle } from '#icons/data/check-circle.js'
import { spinner } from '#icons/data/spinner.js'
import { warningCircle } from '#icons/data/warning-circle.js'
import { Svg } from '#components/svg/index.js'
import { BORDER } from '#shared/classes.js'
import { cn } from '#shared/cn.js'

const CELL = 'grid min-h-14 place-items-center'
// The stack overflows its 56 px row as the frame's does, so every caption sits on one line.
const STACKED = 'p-2 text-muted'

/** A toast drawn in place, small, with the look the viewport gives one: a picture of a state, not a live region. */
function Panel({ icon, label, className }: { icon?: ReactNode; label: string; className?: string }) {
  return (
    <div className={cn('flex w-34 items-center gap-1.75 rounded-box bg-surface-raised px-2.25 py-2.25 font-mono text-xs/tight text-body shadow-(--tc-shadow-toast)', BORDER, className)}>
      {icon}
      {label}
    </div>
  )
}

/** The frame's strip, one equal cell a state: the three icons, a stack, a toast fading in (a dashed edge, since a faded
 * text would fail 4.5:1), and one past the limit, which the viewport keeps mounted and does not draw. */
export default function Demo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] gap-4">
      <div role="group" aria-label="success" className={CELL}>
        <Panel icon={<Svg icon={checkCircle} size="0.875rem" className="text-success-on-soft" />} label="success" />
      </div>
      <div role="group" aria-label="error" className={CELL}>
        <Panel icon={<Svg icon={warningCircle} size="0.875rem" className="text-danger-on-soft" />} label="error" />
      </div>
      <div role="group" aria-label="loading" className={CELL}>
        <Panel icon={<Svg icon={spinner} size="0.875rem" className="animate-spin text-muted motion-reduce:animate-none" />} label="loading" />
      </div>
      <div role="group" aria-label="stacked" className="grid h-14 content-center justify-center place-items-start">
        <Panel label="toast" className={cn(STACKED, 'w-30')} />
        <Panel label="toast" className={cn(STACKED, '-mt-1.5 w-28')} />
        <Panel label="toast" className={cn(STACKED, '-mt-1.5 w-26')} />
      </div>
      <div role="group" aria-label="entering" className={CELL}>
        <Panel icon={<Svg icon={checkCircle} size="0.875rem" className="text-success-on-soft" />} label="entering" className="border-dashed border-line-strong" />
      </div>
      <div role="group" aria-label="limited" className={CELL}>
        <p className="w-34 text-center text-xs text-muted">Past the limit: mounted, not drawn.</p>
      </div>
    </div>
  )
}
