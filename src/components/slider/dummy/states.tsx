import { Slider } from '../index.js'

/** The states a server can render. Invalid draws a line around the track as well as the red. A slider has no read-only
 * state: Base UI has none. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-4">
      <Slider aria-label="Live" defaultValue={40} />
      <Slider aria-label="Invalid" invalid defaultValue={40} />
      <Slider aria-label="Disabled" disabled defaultValue={40} />
      <Slider aria-label="Invalid range" invalid defaultValue={[20, 70]} />
    </div>
  )
}
