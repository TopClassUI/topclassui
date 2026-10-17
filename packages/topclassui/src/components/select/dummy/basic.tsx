import { Select } from '../index.js'

const COUNTRIES = [
  { value: 'jo', label: 'Jordan' },
  { value: 'eg', label: 'Egypt' },
  { value: 'ma', label: 'Morocco' },
  { value: 'sa', label: 'Saudi Arabia' },
]

/** A label that points at the trigger by its id, and a list of plain data: the server prints "Jordan" in the trigger. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-1.5">
      <label htmlFor="select-basic" className="text-sm text-body">Country</label>
      <Select id="select-basic" items={COUNTRIES} defaultValue="jo" />
    </div>
  )
}
