import { Slider } from '../index.js'

/** Outside a Field: the slider is named by the visible text above it. Drag the thumb, press the track, or use the arrows. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-2">
      <span id="slider-basic-label" className="text-sm text-body">Volume</span>
      <Slider aria-labelledby="slider-basic-label" defaultValue={60} step={5} />
    </div>
  )
}
