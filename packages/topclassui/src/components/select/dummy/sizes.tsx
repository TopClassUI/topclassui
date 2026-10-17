import { Select } from '../index.js'

const SIZES = [
  { size: 'xs', label: 'Extra small' },
  { size: 'sm', label: 'Small' },
  { size: 'md', label: 'Medium' },
  { size: 'lg', label: 'Large' },
  { size: 'xl', label: 'Extra large' },
] as const

const PLANS = [{ value: 'free', label: 'Free' }, { value: 'pro', label: 'Pro' }, { value: 'team', label: 'Team' }]

/** The five sizes: the height, the padding and the type step change, and the width follows the type step. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      {SIZES.map(({ size, label }) => (
        <Select key={size} aria-label={label} size={size} items={PLANS} defaultValue="pro" />
      ))}
    </div>
  )
}
