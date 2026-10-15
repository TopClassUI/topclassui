import { Button } from '#components/button/index.js'
import { Combobox } from '../index.js'

const FRAMEWORKS = [
  { value: 'next', label: 'Next.js' },
  { value: 'astro', label: 'Astro' },
  { value: 'remix', label: 'Remix' },
]

/** The value, not the label, is what the form receives: framework=next, before any script runs and after. */
export default function Demo() {
  return (
    <form className="grid justify-items-start gap-3">
      <label htmlFor="combobox-form" className="text-sm font-medium text-body">Framework</label>
      <Combobox id="combobox-form" name="framework" items={FRAMEWORKS} defaultValue="next" />
      <Button type="submit">Save</Button>
    </form>
  )
}
