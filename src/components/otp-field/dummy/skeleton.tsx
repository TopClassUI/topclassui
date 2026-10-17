import { OTPField, OTPFieldSkeleton } from '../index.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

/** Lengths other than the default: four cells, six in two groups, and twelve, which break at whole cells. */
const SHAPES = [
  { pair: 'four', length: 4, groupSize: 0 },
  { pair: 'grouped', length: 6, groupSize: 3 },
  { pair: 'twelve', length: 12, groupSize: 0 },
] as const

/** Each field above the skeleton that holds its place, in a wrapper each: the same cells, gaps and separators. */
export default function Demo() {
  return (
    <div className="grid gap-4">
      {SIZES.map((size) => (
        <div key={size} data-pair={size} className="grid gap-2">
          <label htmlFor={`otp-field-skeleton-${size}`} className="text-sm text-body">{`Code, ${size}`}</label>
          <div><OTPField id={`otp-field-skeleton-${size}`} size={size} /></div>
          <div><OTPFieldSkeleton size={size} /></div>
        </div>
      ))}
      {SHAPES.map(({ pair, length, groupSize }) => (
        <div key={pair} data-pair={pair} className="grid gap-2">
          <label htmlFor={`otp-field-skeleton-${pair}`} className="text-sm text-body">{`Code, ${pair}`}</label>
          <div><OTPField id={`otp-field-skeleton-${pair}`} length={length} groupSize={groupSize} /></div>
          <div><OTPFieldSkeleton length={length} groupSize={groupSize} /></div>
        </div>
      ))}
    </div>
  )
}
