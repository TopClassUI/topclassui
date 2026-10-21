import { Progress } from '../index.js'

/** Every state the strip draws, one cell each, captioned by its name: empty, half, complete (success, with no tone
 * asked for), success, danger and indeterminate. Each bar is 112 px, so a cell that shrinks to fit its content keeps it. */
export default function Demo() {
  return (
    <div className="grid gap-4">
      <Progress className="w-28" value={0} aria-label="empty" />
      <Progress className="w-28" value={50} aria-label="half" />
      <Progress className="w-28" value={100} aria-label="complete" />
      <Progress className="w-28" tone="success" value={100} aria-label="success" />
      <Progress className="w-28" tone="danger" value={40} aria-label="danger" />
      <Progress className="w-28" indeterminate aria-label="indeterminate" />
    </div>
  )
}
