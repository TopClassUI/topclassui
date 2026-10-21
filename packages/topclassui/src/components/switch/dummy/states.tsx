import { Switch } from '../index.js'

/** The ring the track wears on focus-visible, drawn at rest round the target the md track fills; not under forced colours, where a ring at rest would read as focus. */
const RING = 'rounded-full not-forced-colors:outline-solid not-forced-colors:outline-(length:--tc-ring-width) not-forced-colors:outline-offset-(length:--tc-ring-offset) not-forced-colors:outline-ring'

/** One cell per state the Previewer frame draws, named by its aria-label. Hover is drawn as the frame draws it, the same as off. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Switch aria-label="off" />
      <Switch defaultChecked aria-label="on" />
      <Switch aria-label="hover" />
      <Switch aria-label="focus-visible" className={RING} />
      <Switch disabled aria-label="disabled" />
      <Switch invalid aria-label="invalid" />
    </div>
  )
}
