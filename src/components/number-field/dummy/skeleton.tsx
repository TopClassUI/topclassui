import { NumberField, NumberFieldSkeleton } from '../index.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

/** Each field above the skeleton that holds its place, in a wrapper each: the same box, and the whole column with fullWidth. */
export default function Demo() {
  return (
    <div className="grid gap-4">
      {SIZES.map((size) => (
        <div key={size} data-pair={size} className="grid gap-2">
          <div><NumberField size={size} defaultValue={12} aria-label={`Guests, ${size}`} /></div>
          <div><NumberFieldSkeleton size={size} /></div>
        </div>
      ))}
      <div data-pair="full" className="grid gap-2">
        <div><NumberField fullWidth defaultValue={12} aria-label="Guests, full width" /></div>
        <div><NumberFieldSkeleton fullWidth /></div>
      </div>
    </div>
  )
}
