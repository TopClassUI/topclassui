import { Select } from '../index.js'
import type { SelectDesignProps } from '../types.js'

const COUNTRIES = [
  { value: 'jo', label: 'Jordan' },
  { value: 'eg', label: 'Egypt' },
  { value: 'ma', label: 'Morocco' },
  { value: 'sa', label: 'Saudi Arabia' },
]

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default. */
export default function Demo(props: SelectDesignProps) {
  return (
    <div className="grid justify-items-start gap-1.5">
      <label htmlFor="select-playground" className="text-sm text-body">Country</label>
      <Select id="select-playground" items={COUNTRIES} defaultValue="jo" {...props} />
    </div>
  )
}
