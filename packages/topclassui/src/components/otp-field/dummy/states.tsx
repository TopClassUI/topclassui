import { OTPField } from '../index.js'

/** One cell per state the Previewer frame draws, in its order, captioned by its title, each a four-cell code at the small size the frame draws.
 * Its focus-visible cell rings one input inside the group, which no class from outside reaches. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div title="idle">
        <label htmlFor="otp-states-idle" className="sr-only">Code</label>
        <OTPField id="otp-states-idle" length={4} size="xs" />
      </div>
      <div title="partly filled">
        <label htmlFor="otp-states-partly-filled" className="sr-only">Code</label>
        <OTPField id="otp-states-partly-filled" length={4} size="xs" defaultValue="48" />
      </div>
      <div title="complete">
        <label htmlFor="otp-states-complete" className="sr-only">Code</label>
        <OTPField id="otp-states-complete" length={4} size="xs" defaultValue="4829" />
      </div>
      <div title="invalid">
        <label htmlFor="otp-states-invalid" className="sr-only">Code</label>
        <OTPField id="otp-states-invalid" length={4} size="xs" invalid defaultValue="48" />
      </div>
      <div title="disabled">
        <label htmlFor="otp-states-disabled" className="sr-only">Code</label>
        <OTPField id="otp-states-disabled" length={4} size="xs" disabled defaultValue="48" />
      </div>
    </div>
  )
}
