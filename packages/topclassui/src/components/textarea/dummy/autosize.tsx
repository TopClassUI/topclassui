import { Textarea } from '../index.js'

const LONG = ['One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight'].join('\n')

/** One empty field that grows from three rows to six as lines come, and one already past six that scrolls. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-3">
      <Textarea fullWidth autosize placeholder="Grows as you write" aria-label="Grows" />
      <Textarea fullWidth autosize defaultValue={LONG} aria-label="Past six rows" />
    </div>
  )
}
