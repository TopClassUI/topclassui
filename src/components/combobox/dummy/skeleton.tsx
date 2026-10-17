import { Combobox, ComboboxSkeleton } from '../index.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

const FRUITS = [{ value: 'apple', label: 'Apple' }, { value: 'banana', label: 'Banana' }, { value: 'cherry', label: 'Cherry' }]

/** Each closed Combobox above the skeleton that holds its place, in a wrapper each: the same box. */
export default function Demo() {
  return (
    <div className="grid gap-4">
      {SIZES.map((size) => (
        <div key={size} data-pair={size} className="grid gap-2">
          <div><Combobox size={size} aria-label={`Fruit, ${size}`} items={FRUITS} defaultValue="banana" /></div>
          <div><ComboboxSkeleton size={size} /></div>
        </div>
      ))}
      <div data-pair="full" className="grid gap-2">
        <div><Combobox fullWidth aria-label="Fruit, full width" items={FRUITS} defaultValue="banana" /></div>
        <div><ComboboxSkeleton fullWidth /></div>
      </div>
    </div>
  )
}
