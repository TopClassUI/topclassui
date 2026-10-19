import { x } from '#icons/data/x.js'
import { Svg } from '#components/svg/index.js'
import { cn } from '#shared/cn.js'
import {
  TOAST_CONTENT, TOAST_ICON, TOAST_ICON_SVG, TOAST_ICON_TONE, TOAST_ROOT, TOAST_TITLE,
} from '../classes.js'
import { TOAST_ICONS } from '../constants.js'
import type { ToastIconType } from '../types.js'

/** A toast drawn in place, with the classes the viewport gives one: a picture of a state, not a live region. */
function Panel({ type, title, className }: { type?: ToastIconType; title: string; className?: string }) {
  return (
    <div className={cn(TOAST_ROOT, 'w-72', className)}>
      {type === undefined ? null : (
        <span className={cn(TOAST_ICON, TOAST_ICON_TONE[type])}>
          <Svg icon={TOAST_ICONS[type]} className={TOAST_ICON_SVG[type]} />
        </span>
      )}
      <div className={TOAST_CONTENT}>
        <p className={TOAST_TITLE}>{title}</p>
      </div>
      <span className="col-start-3 row-start-1 ms-2.5 text-muted">
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
      <div role="group" aria-label="success"><Panel type="success" title="Invitation sent" /></div>
      <div role="group" aria-label="error"><Panel type="error" title="Could not save" /></div>
      <div role="group" aria-label="loading"><Panel type="loading" title="Uploading" /></div>
      <div role="group" aria-label="stacked" className="flex flex-col gap-2">
        <Panel title="Draft saved" />
        <Panel title="Draft saved" />
        <Panel title="Draft saved" />
      </div>
      <div role="group" aria-label="entering"><Panel type="success" title="Invitation sent" className="opacity-55" /></div>
      <div role="group" aria-label="limited">
        <p className="text-xs text-muted">Past the limit: mounted, not drawn.</p>
      </div>
    </div>
  )
}
