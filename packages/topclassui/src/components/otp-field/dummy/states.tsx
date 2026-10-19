import { OTPField } from '../index.js'

/** The states a server can render, one per child with its label, then partly filled and complete. A read-only field looks like a live one: it says so to a screen reader only. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      <div title="Invalid" className="grid justify-items-start gap-2">
        <label htmlFor="otp-states-invalid" className="text-sm text-body">Invalid</label>
        <OTPField id="otp-states-invalid" invalid defaultValue="482913" />
      </div>
      <div title="Disabled" className="grid justify-items-start gap-2">
        <label htmlFor="otp-states-disabled" className="text-sm text-body">Disabled</label>
        <OTPField id="otp-states-disabled" disabled defaultValue="482" />
      </div>
      <div title="Read-only" className="grid justify-items-start gap-2">
        <label htmlFor="otp-states-read-only" className="text-sm text-body">Read-only</label>
        <OTPField id="otp-states-read-only" readOnly defaultValue="482913" />
      </div>
      <div title="Partly filled" className="grid justify-items-start gap-2">
        <label htmlFor="otp-states-partly" className="text-sm text-body">Partly filled</label>
        <OTPField id="otp-states-partly" defaultValue="48" />
      </div>
      <div title="Complete" className="grid justify-items-start gap-2">
        <label htmlFor="otp-states-complete" className="text-sm text-body">Complete</label>
        <OTPField id="otp-states-complete" defaultValue="482913" />
      </div>
    </div>
  )
}
