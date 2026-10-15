import { Button } from '#components/button/index.js'
import { OTPField } from '../index.js'

/** In a plain form: it sends code= before anything is typed, and what is typed so far after, a partial code too. */
export default function Demo() {
  return (
    <form className="grid justify-items-start gap-3">
      <label htmlFor="otp-form-code" className="text-sm text-body">Verification code</label>
      <OTPField id="otp-form-code" name="code" />
      <Button type="submit">Verify</Button>
    </form>
  )
}
