import { OTPField } from '../index.js'
import type { OtpFieldDesignProps } from '../types.js'

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default. */
export default function Demo(props: OtpFieldDesignProps) {
  return (
    <div className="grid justify-items-start gap-2">
      <label htmlFor="otp-playground-code" className="text-sm text-body">Verification code</label>
      <OTPField id="otp-playground-code" {...props} />
    </div>
  )
}
