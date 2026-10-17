import { OTPField } from '../index.js'

/** Six cells in two groups of three, with a bar between them that a screen reader does not read. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-2">
      <label htmlFor="otp-grouped-code" className="text-sm text-body">Verification code</label>
      <OTPField id="otp-grouped-code" groupSize={3} />
    </div>
  )
}
