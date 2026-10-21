import { Progress } from '../index.js'

/** Every state the strip draws, one cell each, captioned by its name: empty, half, complete (success, with no tone
 * asked for), success, danger and indeterminate. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-4">
      <Progress value={0} aria-label="empty" />
      <Progress value={50} aria-label="half" />
      <Progress value={100} aria-label="complete" />
      <Progress tone="success" value={100} aria-label="success" />
      <Progress tone="danger" value={40} aria-label="danger" />
      <Progress indeterminate aria-label="indeterminate" />
    </div>
  )
}
