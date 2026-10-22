import { Button } from '../index.js'

/** The ring Button wears on focus-visible, drawn at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** One cell per state, named by its aria-label. Hover, active and focus-visible are drawn with
 * the variables and the ring the live states read, so the strip shows what a pointer would. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div role="group" aria-label="idle"><Button>Save</Button></div>
      <div role="group" aria-label="hover"><Button className="bg-(--tc-hover)">Save</Button></div>
      <div role="group" aria-label="active"><Button className="bg-(--tc-active)">Save</Button></div>
      <div role="group" aria-label="focus-visible"><Button className={RING}>Save</Button></div>
      <div role="group" aria-label="disabled"><Button disabled>Save</Button></div>
      <div role="group" aria-label="loading"><Button loading>Save</Button></div>
    </div>
  )
}
