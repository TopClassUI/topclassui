import { OTPField } from '../index.js'

/** The ring the third cell wears on focus-visible, drawn at rest so the strip can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'not-forced-colors:*:nth-3:outline-solid not-forced-colors:*:nth-3:outline-(length:--tc-ring-width) not-forced-colors:*:nth-3:outline-offset-(length:--tc-ring-offset) not-forced-colors:*:nth-3:outline-ring'

/** One cell per state the strip draws, captioned by its title: a short field of four small cells, named by a hidden
 * label. Read-only and the full six cells are in the combined demo. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div title="idle">
        <label htmlFor="otp-strip-idle" className="sr-only">Code, idle</label>
        <OTPField id="otp-strip-idle" length={4} size="xs" className="gap-1.25" />
      </div>
      <div title="focus-visible">
        <label htmlFor="otp-strip-focus" className="sr-only">Code, focus-visible</label>
        <OTPField id="otp-strip-focus" length={4} size="xs" defaultValue="48" className={`${RING} gap-1.25`} />
      </div>
      <div title="partly filled">
        <label htmlFor="otp-strip-partly" className="sr-only">Code, partly filled</label>
        <OTPField id="otp-strip-partly" length={4} size="xs" defaultValue="48" className="gap-1.25" />
      </div>
      <div title="complete">
        <label htmlFor="otp-strip-complete" className="sr-only">Code, complete</label>
        <OTPField id="otp-strip-complete" length={4} size="xs" defaultValue="4829" className="gap-1.25" />
      </div>
      <div title="invalid">
        <label htmlFor="otp-strip-invalid" className="sr-only">Code, invalid</label>
        <OTPField id="otp-strip-invalid" length={4} size="xs" invalid defaultValue="48" className="gap-1.25" />
      </div>
      <div title="disabled">
        <label htmlFor="otp-strip-disabled" className="sr-only">Code, disabled</label>
        <OTPField id="otp-strip-disabled" length={4} size="xs" disabled defaultValue="48" className="gap-1.25" />
      </div>
    </div>
  )
}
