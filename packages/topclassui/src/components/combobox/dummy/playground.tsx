import { Combobox } from '../index.js'
import type { ComboboxDesignProps } from '../types.js'

const FRAMEWORKS = [
  { value: 'next', label: 'Next.js' },
  { value: 'astro', label: 'Astro' },
  { value: 'remix', label: 'Remix' },
  { value: 'sveltekit', label: 'SvelteKit' },
  { value: 'nuxt', label: 'Nuxt' },
  { value: 'gatsby', label: 'Gatsby' },
  { value: 'vite', label: 'Vite' },
  { value: 'qwik', label: 'Qwik City' },
  { value: 'solid', label: 'SolidStart' },
  { value: 'angular', label: 'Angular' },
]

const PLACES = [
  { value: 'jo', label: 'Jordan' },
  { value: 'jv', label: 'Jordan Valley' },
  { value: 'eg', label: 'Egypt' },
  { value: 'ma', label: 'Morocco' },
]

/** The list drawn open under its input, as the frame draws it: "jor" typed, Jordan chosen, no label, not modal. */
function Stage(props: ComboboxDesignProps) {
  return (
    <div data-stage="" className="flex min-h-44 w-full justify-center pt-12">
      <Combobox aria-label="Country" items={PLACES} defaultValue="jo" defaultInputValue="jor" defaultOpen modal={false} {...props} />
    </div>
  )
}

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default.
 * With stage it is the Stage above; the tree below stays one return, so the docs can write Try it values into it. */
export default function Demo({ stage = false, ...props }: ComboboxDesignProps & { stage?: boolean } = {}) {
  if (stage) return <Stage {...props} />
  return (
    <div className="grid justify-items-start gap-1">
      <label htmlFor="combobox-playground" className="text-sm font-medium text-body">Framework</label>
      <Combobox id="combobox-playground" items={FRAMEWORKS} placeholder="Search frameworks" {...props} />
    </div>
  )
}
