import { Combobox } from '../index.js'

const FRUITS = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
  { value: 'date', label: 'Date' },
]

/** The five steps of the field scale, each an Input wide at its own type step. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      <Combobox aria-label="Fruit, extra small" size="xs" items={FRUITS} defaultValue="apple" />
      <Combobox aria-label="Fruit, small" size="sm" items={FRUITS} defaultValue="banana" />
      <Combobox aria-label="Fruit, medium" size="md" items={FRUITS} defaultValue="cherry" />
      <Combobox aria-label="Fruit, large" size="lg" items={FRUITS} defaultValue="date" />
      <Combobox aria-label="Fruit, extra large" size="xl" items={FRUITS} />
    </div>
  )
}
