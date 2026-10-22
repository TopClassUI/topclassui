import { Button } from '#components/button/index.js'
import { OVERLAY_SURFACE } from '#shared/classes.js'
import { PopoverDescription, PopoverPopup, PopoverRoot, PopoverTitle, PopoverTrigger } from '../index.js'

// A row of the frame's 58 px: an open group reaches past it above and below, as drawn.
const CELL = 'flex h-14.5 w-45 items-center justify-center'
// The popup's look, written out from the shared classes: a demo the site shows imports public paths only.
const panel = `w-27.5 p-2 font-mono text-[0.6875rem]/tight text-muted ${OVERLAY_SURFACE}`

/** One cell, captioned by its title: a picture of a small popover at its trigger, below it or flipped above, hidden from
 * a reader and inert, so it draws in every capture, where an open popup hides itself while its trigger is off screen. */
function Open({ title, flipped = false }: { title: string, flipped?: boolean }) {
  return (
    <div title={title} className={CELL}>
      <div aria-hidden inert className={flipped ? 'flex flex-col-reverse items-center gap-1' : 'flex flex-col items-center gap-1'}>
        <Button variant="outline" size="xs">Open</Button>
        <div className={panel}>panel</div>
      </div>
    </div>
  )
}

/** Every state the frame draws, one equal cell each, captioned by its title: the real closed popover behind its
 * trigger, then pictures of one open below its trigger and one flipped above it. */
export default function Demo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
      <div title="closed" className={CELL}>
        <PopoverRoot>
          <PopoverTrigger render={<Button variant="outline" size="xs">Share</Button>} />
          <PopoverPopup>
            <PopoverTitle>Share this page</PopoverTitle>
            <PopoverDescription>Its trigger opened it; Escape or a press outside closes it.</PopoverDescription>
          </PopoverPopup>
        </PopoverRoot>
      </div>
      <Open title="open" />
      <Open title="flipped" flipped />
    </div>
  )
}
