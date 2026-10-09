import { Input } from '../index.js'

/** Each text type takes its own default cap; a number or a date takes none at all. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-3">
      <Input fullWidth type="email" autoComplete="email" placeholder="you@example.com" aria-label="Email" />
      <Input fullWidth type="password" autoComplete="current-password" placeholder="Password" aria-label="Password" />
      <Input fullWidth type="search" placeholder="Search" aria-label="Search" />
      <Input fullWidth type="tel" autoComplete="tel" placeholder="+962 7 9000 0000" aria-label="Phone" />
      <Input fullWidth type="url" placeholder="https://example.com" aria-label="Website" />
      <Input fullWidth type="number" min={0} max={120} step={1} placeholder="Age" aria-label="Age" />
      <Input fullWidth type="date" aria-label="Start date" />
      <Input fullWidth maxLength={6} placeholder="Six characters" aria-label="Short code" />
      <Input fullWidth maxLength={null} placeholder="No cap" aria-label="Uncapped" />
    </div>
  )
}
