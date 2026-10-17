import { Select, SelectSkeleton } from '../index.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

const PLANS = [{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }, { value: 'team', label: 'Team' }]

/** Each closed Select above the skeleton that holds its place, in a wrapper each: the same box. */
export default function Demo() {
  return (
    <div className="grid gap-4">
      {SIZES.map((size) => (
        <div key={size} data-pair={size} className="grid gap-2">
          <div><Select size={size} aria-label={`Plan, ${size}`} items={PLANS} defaultValue="pro" /></div>
          <div><SelectSkeleton size={size} /></div>
        </div>
      ))}
      <div data-pair="full" className="grid gap-2">
        <div><Select fullWidth aria-label="Plan, full width" items={PLANS} defaultValue="pro" /></div>
        <div><SelectSkeleton fullWidth /></div>
      </div>
    </div>
  )
}
