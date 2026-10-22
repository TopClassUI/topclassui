import { Input } from '../index.js'

/** The docs stage as the frame draws it: an empty field beside a filled one, no label. */
export default function Demo() {
  return (
    <div className="flex flex-wrap justify-center gap-3">
      <Input type="email" placeholder="Email" aria-label="Email" />
      <Input type="email" defaultValue="you@mail.com" aria-label="Email, filled" />
    </div>
  )
}
