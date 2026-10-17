import { Select } from '../index.js'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
].map((label, at) => ({ value: String(at + 1), label }))

/** visibleRows={4}: the list is four rows tall and scrolls through the other eight. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-1.5">
      <label htmlFor="select-four-rows" className="text-sm text-body">Month</label>
      <Select id="select-four-rows" items={MONTHS} defaultValue="3" visibleRows={4} />
    </div>
  )
}
