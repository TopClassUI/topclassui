import { Combobox } from '../index.js'

const COUNTRIES = [
  { value: 'jo', label: 'Jordan' },
  { value: 'eg', label: 'Egypt' },
  { value: 'ma', label: 'Morocco', disabled: true },
  { value: 'sa', label: 'Saudi Arabia' },
]

/** The states a server can render: invalid, disabled, read-only, and one option that cannot be chosen. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      <Combobox aria-label="Invalid" invalid items={COUNTRIES} defaultValue="jo" />
      <Combobox aria-label="Disabled" disabled items={COUNTRIES} defaultValue="eg" />
      <Combobox aria-label="Read-only" readOnly items={COUNTRIES} defaultValue="sa" />
      <Combobox aria-label="One option disabled" items={COUNTRIES} />
    </div>
  )
}
