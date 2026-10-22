import { arrowDown } from '#icons/data/arrow-down.js'
import { arrowUp } from '#icons/data/arrow-up.js'
import { linkSimple } from '#icons/data/link-simple.js'
import { Button } from '#components/button/index.js'
import { Svg } from '#components/svg/index.js'
import { TooltipPopup, TooltipRoot, TooltipTrigger } from '../index.js'

const CELL = 'grid h-28 w-56 place-items-center'
// The tooltip's look, written out: a demo the site shows imports public paths only.
const tip = 'relative rounded-control bg-neutral-solid px-2 py-1 text-xs text-neutral-on-solid'
// R-5.3-2: the half-width step multiplies by --tc-dir, so the arrow stays centred under the tip in Arabic.
const arrow = 'absolute inset-s-1/2 size-2 -translate-x-[calc(50%*var(--tc-dir))] rotate-45 bg-neutral-solid'

/** One cell, captioned by its title: a picture of a tooltip at its trigger, above or below it, its arrow toward it, hidden
 * from a reader and inert, so it draws in every capture, where an open tooltip hides itself while its trigger is off screen. */
function Open({ title, label, icon, below = false }: { title: string, label: string, icon: typeof arrowUp, below?: boolean }) {
  return (
    <div title={title} className={CELL}>
      <div aria-hidden inert className={below ? 'flex flex-col-reverse items-center gap-2.75' : 'flex flex-col items-center gap-2.75'}>
        <span className={tip}>
          {label}
          <span className={below ? `${arrow} -top-1` : `${arrow} -bottom-1`} />
        </span>
        <span className="grid h-control-md w-12 place-items-center">
          <Svg icon={icon} />
        </span>
      </div>
    </div>
  )
}

/** Every state the frame draws, one equal cell each, captioned by its title: the real tooltip of a trigger at rest, then
 * pictures of one above its trigger and one below it. */
export default function Demo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
      <div title="hidden" className={CELL}>
        <TooltipRoot>
          <TooltipTrigger
            render={
              <Button variant="ghost" aria-label="Copy link">
                <Svg icon={linkSimple} />
              </Button>
            }
          />
          <TooltipPopup>Copy link</TooltipPopup>
        </TooltipRoot>
      </div>
      <Open title="top" label="Top" icon={arrowUp} />
      <Open title="bottom" label="Bottom" icon={arrowDown} below />
    </div>
  )
}
