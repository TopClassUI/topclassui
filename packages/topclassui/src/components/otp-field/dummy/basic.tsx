import { OTPField } from '../index.js'

/** Outside a Field: a native label points at the id of the field, which is the first cell, and a hint describes it. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-2">
      <label htmlFor="otp-basic-code" className="text-sm text-body">Verification code</label>
      <OTPField id="otp-basic-code" aria-describedby="otp-basic-hint" />
      <p id="otp-basic-hint" className="text-sm text-muted">Six digits from your authenticator app</p>
    </div>
  )
}
