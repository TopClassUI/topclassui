import { Input } from '../index.js'

/** Outside a Field: a label points at the id, and aria-describedby ties the hint on. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-1">
      <label htmlFor="demo-email" className="text-sm font-medium text-body">Email</label>
      <Input
        id="demo-email"
        name="email"
        type="email"
        autoComplete="email"
        required
        fullWidth
        aria-describedby="demo-email-hint"
      />
      <span id="demo-email-hint" className="text-xs text-muted">We never share it</span>
    </div>
  )
}
