import { Progress } from '../index.js'

/** Every state the strip draws, one cell each, captioned by its name: empty, half, complete (success, with no tone
 * asked for), success, danger and indeterminate. A bar fills its box, so each cell is as wide as the frame draws it. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div role="group" aria-label="empty" className="w-28"><Progress value={0} aria-label="empty" /></div>
      <div role="group" aria-label="half" className="w-28"><Progress value={50} aria-label="half" /></div>
      <div role="group" aria-label="complete" className="w-28"><Progress value={100} aria-label="complete" /></div>
      <div role="group" aria-label="success" className="w-28"><Progress tone="success" value={100} aria-label="success" /></div>
      <div role="group" aria-label="danger" className="w-28"><Progress tone="danger" value={40} aria-label="danger" /></div>
      <div role="group" aria-label="indeterminate" className="w-28"><Progress indeterminate aria-label="indeterminate" /></div>
    </div>
  )
}
