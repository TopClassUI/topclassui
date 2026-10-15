import { Combobox } from '../index.js'

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

/** Named by a label that points at its id. Typing filters by "contains"; the arrows move, Enter chooses. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-1">
      <label htmlFor="combobox-basic" className="text-sm font-medium text-body">Framework</label>
      <Combobox id="combobox-basic" items={FRAMEWORKS} placeholder="Search frameworks" />
    </div>
  )
}
