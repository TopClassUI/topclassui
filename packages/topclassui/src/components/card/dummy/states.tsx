import { Skeleton } from '#components/skeleton/index.js'
import { cn } from '#shared/cn.js'
import { CardRoot } from '../index.js'

/** The ring an interactive card wears on focus-visible, drawn at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** The small panel Figma 137:705 draws per state: a title bar over a line bar; the title bar is the heading, named for a screen reader. */
function Sample({ className }: { className?: string }) {
  return (
    <CardRoot render={<a href="#report" />} className={cn('w-37.5 gap-1.5 p-3', className)}>
      <h2>
        <span className="sr-only">Monthly report</span>
        <Skeleton variant="rect" className="h-2 w-20" />
      </h2>
      <Skeleton variant="rect" className="h-1.5 w-27.5" />
    </CardRoot>
  )
}

/** One cell per state of a card rendered as a link, named by its aria-label, as Previewer: Card draws them. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div role="group" aria-label="idle"><Sample /></div>
      <div role="group" aria-label="hover"><Sample className="bg-surface" /></div>
      <div role="group" aria-label="focus-visible"><Sample className={RING} /></div>
    </div>
  )
}
