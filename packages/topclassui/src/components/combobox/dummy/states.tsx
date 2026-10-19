import { Combobox } from '../index.js'

const COUNTRIES = [
  { value: 'jo', label: 'Jordan' },
  { value: 'eg', label: 'Egypt' },
  { value: 'ma', label: 'Morocco', disabled: true },
  { value: 'sa', label: 'Saudi Arabia' },
]

/** The states a server can render: invalid, disabled, read-only, one option that cannot be chosen, and loading. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      <Combobox aria-label="Invalid" invalid items={COUNTRIES} defaultValue="jo" />
      <Combobox aria-label="Disabled" disabled items={COUNTRIES} defaultValue="eg" />
      <Combobox aria-label="Read-only" readOnly items={COUNTRIES} defaultValue="sa" />
      <Combobox aria-label="One option disabled" items={COUNTRIES} />
      <Combobox aria-label="Loading" status="loading" items={[]} defaultInputValue="jor" />
    </div>
  )
}
