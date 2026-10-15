import { Combobox } from '../index.js'

/** Ten thousand options, built once at module scope so the array is stable between renders. */
const OPTIONS = Array.from({ length: 10_000 }, (_, index) => ({
  value: String(index + 1),
  label: `Option ${String(index + 1)}`,
}))

/** Windowed: about twenty rows are mounted whatever the scroll, and the highlight still reaches every one of them. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-1">
      <label htmlFor="combobox-ten-thousand" className="text-sm font-medium text-body">Ten thousand options</label>
      <Combobox id="combobox-ten-thousand" name="option" items={OPTIONS} />
    </div>
  )
}
