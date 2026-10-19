import type { ReactNode } from 'react'

import { checkCircle } from '#icons/data/check-circle.js'
import { spinner } from '#icons/data/spinner.js'
import { warningCircle } from '#icons/data/warning-circle.js'
import { x } from '#icons/data/x.js'
import { Svg } from '#components/svg/index.js'
import { BORDER } from '#shared/classes.js'
import { cn } from '#shared/cn.js'

/** A toast drawn in place with the look the viewport gives one: a picture of a state, not a live region. */
function Panel({ icon, title, className }: { icon?: ReactNode; title: string; className?: string }) {
  return (
    <div className={cn('grid w-72 grid-cols-[auto_minmax(0,1fr)_auto] items-start rounded-box bg-surface-raised p-3.5 text-body shadow-(--tc-shadow-toast)', BORDER, className)}>
      {icon === undefined ? null : <span className="me-2.5 flex h-5 items-center">{icon}</span>}
      <p className="col-start-2 text-sm/tight font-semibold">{title}</p>
      <span className="col-start-3 ms-2.5 text-muted">
        <Svg icon={x} size="0.875em" />
      </span>
    </div>
  )
}

/** The frame's strip, one cell a state: the three icons, a stack, a toast fading in, and one past the limit, which
 * the viewport keeps mounted and does not draw. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <div role="group" aria-label="success">
        <Panel icon={<Svg icon={checkCircle} className="text-success-on-soft" />} title="Invitation sent" />
      </div>
      <div role="group" aria-label="error">
        <Panel icon={<Svg icon={warningCircle} className="text-danger-on-soft" />} title="Could not save" />
      </div>
      <div role="group" aria-label="loading">
        <Panel icon={<Svg icon={spinner} className="animate-spin text-muted motion-reduce:animate-none" />} title="Uploading" />
      </div>
      <div role="group" aria-label="stacked" className="flex flex-col gap-2">
        <Panel title="Draft saved" />
        <Panel title="Draft saved" />
        <Panel title="Draft saved" />
      </div>
      <div role="group" aria-label="entering">
        <Panel icon={<Svg icon={checkCircle} className="text-success-on-soft" />} title="Invitation sent" className="opacity-55" />
      </div>
      <div role="group" aria-label="limited">
        <p className="text-xs text-muted">Past the limit: mounted, not drawn.</p>
      </div>
    </div>
  )
}
