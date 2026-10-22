import { Checkbox } from '../index.js'

/** The stage the frame draws: an unchecked, a checked and a mixed box, bare, each named by its aria-label. */
export default function Demo() {
  return (
    <div className="flex items-center gap-3.5">
      <Checkbox aria-label="Unchecked" />
      <Checkbox defaultChecked aria-label="Checked" />
      <Checkbox indeterminate aria-label="Indeterminate" />
    </div>
  )
}
