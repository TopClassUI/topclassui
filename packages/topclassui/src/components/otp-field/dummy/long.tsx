import { OTPField } from '../index.js'

/** Twelve cells, the most a field takes. Past eight items the row wraps, so on a phone every cell keeps 44 px. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-2">
      <label htmlFor="otp-long-code" className="text-sm text-body">Recovery code</label>
      <OTPField id="otp-long-code" length={12} validationType="alphanumeric" />
    </div>
  )
}
