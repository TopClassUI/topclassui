import { Slider } from '../index.js'

/** showValue writes the value after the track, in the provider's digits; format shapes it, here as dollars. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-4">
      <Slider aria-label="Brightness" defaultValue={40} showValue />
      <Slider
        aria-label="Budget"
        defaultValue={[200, 800]}
        min={0}
        max={1000}
        step={50}
        format={{ style: 'currency', currency: 'USD', maximumFractionDigits: 0 }}
        showValue
      />
    </div>
  )
}
