import { OTPField } from '../index.js'

/** The states a server can render. A read-only field looks like a live one: it says so to a screen reader only. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-2">
      <label htmlFor="otp-states-invalid" className="text-sm text-body">Invalid</label>
      <OTPField id="otp-states-invalid" invalid defaultValue="482913" />
      <label htmlFor="otp-states-disabled" className="text-sm text-body">Disabled</label>
      <OTPField id="otp-states-disabled" disabled defaultValue="482" />
      <label htmlFor="otp-states-read-only" className="text-sm text-body">Read-only</label>
      <OTPField id="otp-states-read-only" readOnly defaultValue="482913" />
    </div>
  )
}
