import { Combobox } from '../index.js'

const FIRST_PAGE = [
  { value: 'a', label: 'Aleppo' },
  { value: 'b', label: 'Beirut' },
  { value: 'c', label: 'Cairo' },
]

/** loading: a spinner in place of the caret, and the list says Loading until the first options arrive. loading-more:
 * the options so far, and a line under them. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      <Combobox aria-label="City, loading" status="loading" items={[]} />
      <Combobox aria-label="City, loading more" status="loading-more" items={FIRST_PAGE} />
    </div>
  )
}
