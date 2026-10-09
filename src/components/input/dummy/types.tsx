import { Input } from '../index.js'

/** Each text type takes its own default cap; a number or a date takes none at all. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-3">
      <Input type="email" autoComplete="email" placeholder="you@example.com" aria-label="Email" />
      <Input type="password" autoComplete="current-password" placeholder="Password" aria-label="Password" />
      <Input type="search" placeholder="Search" aria-label="Search" />
      <Input type="tel" autoComplete="tel" placeholder="+962 7 9000 0000" aria-label="Phone" />
      <Input type="url" placeholder="https://example.com" aria-label="Website" />
      <Input type="number" min={0} max={120} step={1} placeholder="Age" aria-label="Age" />
      <Input type="date" aria-label="Start date" />
      <Input maxLength={6} placeholder="Six characters" aria-label="Short code" />
      <Input maxLength={null} placeholder="No cap" aria-label="Uncapped" />
    </div>
  )
}
