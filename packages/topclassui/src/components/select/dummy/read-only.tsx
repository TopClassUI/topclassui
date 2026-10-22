import { Select } from '../index.js'

const COUNTRIES = [{ value: 'jo', label: 'Jordan' }, { value: 'eg', label: 'Egypt' }, { value: 'ma', label: 'Morocco' }]

/** A read-only trigger looks like a live one and opens on a key, as Base UI's does, but no choice changes it. */
export default function Demo() {
  return <Select aria-label="Read-only" readOnly items={COUNTRIES} defaultValue="jo" />
}
