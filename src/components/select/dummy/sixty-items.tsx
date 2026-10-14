import { Select } from '../index.js'

/** Sixty options, the thirteenth disabled: the list shows seven rows, scrolls inside itself, and opens on the chosen one. */
const OPTIONS = Array.from({ length: 60 }, (_, at) => ({
  value: String(at + 1),
  label: `Option ${String(at + 1)}`,
  ...(at === 12 ? { disabled: true } : {}),
}))

export default function Demo() {
  return (
    <div className="grid justify-items-start gap-1.5">
      <label htmlFor="select-sixty" className="text-sm text-body">Sixty options</label>
      <Select id="select-sixty" items={OPTIONS} defaultValue="30" />
    </div>
  )
}
