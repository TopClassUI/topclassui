import { Separator } from '../index.js'

/** As in the docs sample, the gap of the column spaces the line, which has no margin of its own. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-base text-body">Personal details</p>
      <Separator />
      <p className="text-sm text-muted">Name, email address and phone number.</p>
    </div>
  )
}
