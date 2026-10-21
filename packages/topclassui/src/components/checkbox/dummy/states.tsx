import { Checkbox } from '../index.js'

/** The ring the box wears on focus-visible, drawn at rest on the 24 px target the md box fills; not under forced colours, where a ring at rest would read as focus. */
const RING = 'not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** One cell per state the Previewer frame draws, named by its aria-label. Hover is drawn as the frame draws it, the same as unchecked. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Checkbox aria-label="unchecked" />
      <Checkbox defaultChecked aria-label="checked" />
      <Checkbox indeterminate aria-label="indeterminate" />
      <Checkbox aria-label="hover" />
      <Checkbox aria-label="focus-visible" className={RING} />
      <Checkbox disabled aria-label="disabled" />
    </div>
  )
}
