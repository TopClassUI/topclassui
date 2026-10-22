
import { cn } from '#shared/cn.js'
import { Button } from '#components/button/index.js'
import {
  DrawerBody, DrawerClose, DrawerFooter, DrawerHeader, DrawerPopup, DrawerRoot, DrawerTitle, DrawerTrigger,
} from '../index.js'

const CELL = 'relative -my-1.75 h-18 w-33 justify-self-center overflow-hidden rounded-box bg-page [contain:paint]'
const BAR = 'min-h-2 rounded-chip bg-neutral-soft'
const SHEET = 'absolute bg-surface-raised p-2 font-mono text-[0.6875rem]/tight text-muted border-line'
const EDGE = {
  side: `${SHEET} inset-y-0 inset-e-0 w-14 border-s-(length:--tc-line-width)`,
  bottom: `${SHEET} inset-x-0 bottom-0 h-6.75 border-t-(length:--tc-line-width)`,
} as const

/** The page behind the scrim, as the frame draws it: four bars of text, hidden from a reader. */
function PageBehind() {
  return (
    <div aria-hidden className="absolute inset-0 flex flex-col gap-2 p-3.5">
      <div className={`${BAR} w-1/2`} />
      <div className={`${BAR} w-4/5`} />
      <div className={`${BAR} w-2/3`} />
      <div className={`${BAR} w-2/5`} />
    </div>
  )
}

// The sheet's fill at the frame's 75 %, so the page shows through it; the label stays whole.
const DRAGGING = 'bg-surface-raised/75'
const TRAPPED = 'border-s-(length:--tc-ring-width) border-s-ring'

/** One cell, captioned by its title: a picture of a small sheet open at the inline end or the bottom, over the page and
 * its scrim, as the frame draws it. `className` draws dragging or the trapped focus on the sheet. Hidden from a reader. */
function Sheet({ title, edge = 'side', className }: { title: string, edge?: keyof typeof EDGE, className?: string }) {
  return (
    <div title={title} className={CELL}>
      <PageBehind />
      <div aria-hidden className="absolute inset-0 bg-overlay" />
      <div aria-hidden inert className={cn(EDGE[edge], className)}>sheet</div>
    </div>
  )
}

/** Every state the frame draws, one equal cell each, captioned by its title: the closed trigger, the one real drawer,
 * and pictures of a side and a bottom sheet open over the page and a scrim, mid-drag and with its focus trapped. */
export default function Demo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(10rem,1fr))] gap-4">
      <div title="closed" className="grid h-14.5 place-items-center">
        <DrawerRoot>
          <DrawerTrigger render={<Button variant="outline" size="xs" className="border-line bg-surface">Open</Button>} />
          <DrawerPopup>
            <DrawerHeader>
              <DrawerTitle>Opened</DrawerTitle>
            </DrawerHeader>
            <DrawerBody>Its trigger opened it; Escape, the x or Done closes it.</DrawerBody>
            <DrawerFooter>
              <DrawerClose render={<Button>Done</Button>} />
            </DrawerFooter>
          </DrawerPopup>
        </DrawerRoot>
      </div>
      <Sheet title="side sheet" />
      <Sheet title="bottom sheet" edge="bottom" />
      <Sheet title="dragging" className={DRAGGING} />
      <Sheet title="focus trapped" className={TRAPPED} />
    </div>
  )
}
