import { Slider, SliderSkeleton } from '../index.js'

const PAIRS = [
  { pair: 'xs', size: 'xs', fullWidth: false },
  { pair: 'sm', size: 'sm', fullWidth: false },
  { pair: 'md', size: 'md', fullWidth: false },
  { pair: 'lg', size: 'lg', fullWidth: false },
  { pair: 'xl', size: 'xl', fullWidth: false },
  { pair: 'full', size: 'md', fullWidth: true },
] as const

/** Each slider above the skeleton that holds its place, in a wrapper each: the same box, the target and the track. */
export default function Demo() {
  return (
    <div className="grid gap-6">
      {PAIRS.map(({ pair, size, fullWidth }) => (
        <div key={pair} data-pair={pair} className="grid gap-2">
          <div><Slider size={size} fullWidth={fullWidth} aria-label={`Volume, ${pair}`} defaultValue={40} /></div>
          <div><SliderSkeleton size={size} fullWidth={fullWidth} /></div>
        </div>
      ))}
    </div>
  )
}
