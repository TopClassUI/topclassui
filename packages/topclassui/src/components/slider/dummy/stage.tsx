import { Slider } from '../index.js'

/** The stage the frame draws: two bare sliders, a 260 px track each, named by their aria-labels. */
export default function Demo() {
  return (
    <div className="grid gap-3">
      <Slider aria-label="Volume" defaultValue={40} fullWidth className="w-72" />
      <Slider aria-label="Balance" defaultValue={70} fullWidth className="w-72" />
    </div>
  )
}
