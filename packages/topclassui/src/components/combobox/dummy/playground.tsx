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

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default. */
export default function Demo(props: ComboboxDesignProps) {
  return (
    <div className="grid justify-items-start gap-1">
      <label htmlFor="combobox-playground" className="text-sm font-medium text-body">Framework</label>
      <Combobox id="combobox-playground" items={FRAMEWORKS} placeholder="Search frameworks" {...props} />
    </div>
  )
}
