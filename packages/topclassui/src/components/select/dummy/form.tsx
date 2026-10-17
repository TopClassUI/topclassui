import { Button } from '#components/button/index.js'
import { Select } from '../index.js'

const COUNTRIES = [
  { value: 'jo', label: 'Jordan' },
  { value: 'eg', label: 'Egypt' },
  { value: 'ma', label: 'Morocco' },
]

/** The Select carries the name and the default. It sends country=jo, before any script runs and after. */
export default function Demo() {
  return (
    <form className="grid justify-items-start gap-3">
      <label htmlFor="select-form" className="text-sm text-body">Country</label>
      <Select id="select-form" name="country" items={COUNTRIES} defaultValue="jo" required />
      <Button type="submit">Save</Button>
    </form>
  )
}
