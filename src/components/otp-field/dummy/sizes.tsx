import { OTPField } from '../index.js'

/** The five sizes, each named by the text above it. A cell gives up width before it gives up height. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-3">
      <span id="otp-sizes-xs" className="text-sm text-body">Extra small</span>
      <OTPField size="xs" aria-labelledby="otp-sizes-xs" defaultValue="482" />
      <span id="otp-sizes-sm" className="text-sm text-body">Small</span>
      <OTPField size="sm" aria-labelledby="otp-sizes-sm" defaultValue="482" />
      <span id="otp-sizes-md" className="text-sm text-body">Medium</span>
      <OTPField size="md" aria-labelledby="otp-sizes-md" defaultValue="482" />
      <span id="otp-sizes-lg" className="text-sm text-body">Large</span>
      <OTPField size="lg" aria-labelledby="otp-sizes-lg" defaultValue="482" />
      <span id="otp-sizes-xl" className="text-sm text-body">Extra large</span>
      <OTPField size="xl" aria-labelledby="otp-sizes-xl" defaultValue="482" />
    </div>
  )
}
