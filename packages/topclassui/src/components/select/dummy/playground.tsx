import { Select } from '../index.js'
import type { SelectDesignProps } from '../types.js'

const COUNTRIES = [
  { value: 'jo', label: 'Jordan' },
  { value: 'eg', label: 'Egypt' },
  { value: 'ma', label: 'Morocco' },
  { value: 'sa', label: 'Saudi Arabia' },
]

/** The list drawn open under its trigger, as the frame draws it: three countries, no label, not modal, so the page still scrolls. */
function Stage(props: SelectDesignProps) {
  return (
    <div data-stage="" className="flex min-h-52 w-full justify-center pt-12">
      <Select aria-label="Country" items={COUNTRIES.slice(0, 3)} defaultValue="jo" defaultOpen modal={false} {...props} />
    </div>
  )
}

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default.
 * With stage it is the Stage above; the tree below stays one return, so the docs can write Try it values into it. */
export default function Demo({ stage = false, ...props }: SelectDesignProps & { stage?: boolean } = {}) {
  if (stage) return <Stage {...props} />
  return (
    <div className="grid justify-items-start gap-1.5">
      <label htmlFor="select-playground" className="text-sm text-body">Country</label>
      <Select id="select-playground" items={COUNTRIES} defaultValue="jo" {...props} />
    </div>
  )
}
