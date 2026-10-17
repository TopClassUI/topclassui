import { RadioGroupItem, RadioGroupRoot, RadioGroupSkeleton } from '../index.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

/** Each group of three beside the skeleton that holds its place, in a wrapper each: the same height and circles. */
export default function Demo() {
  return (
    <div className="grid gap-4">
      {SIZES.map((size) => (
        <div key={size} data-pair={size} className="flex items-start gap-4">
          <div>
            <RadioGroupRoot size={size} aria-label={`Billing, ${size}`} defaultValue="yearly">
              <RadioGroupItem value="monthly">Monthly</RadioGroupItem>
              <RadioGroupItem value="yearly">Yearly</RadioGroupItem>
              <RadioGroupItem value="lifetime">Lifetime</RadioGroupItem>
            </RadioGroupRoot>
          </div>
          <div><RadioGroupSkeleton size={size} items={3} /></div>
        </div>
      ))}
    </div>
  )
}
