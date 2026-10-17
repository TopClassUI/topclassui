import { Input } from '../index.js'

export default function Demo() {
  return (
    <div className="grid max-w-md justify-items-start gap-3">
      <Input fullWidth placeholder="Fills its container" aria-label="Full width" />
      <Input placeholder="Keeps its own width" aria-label="Own width" />
    </div>
  )
}
