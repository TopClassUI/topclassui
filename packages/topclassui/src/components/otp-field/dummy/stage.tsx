import { OTPField } from '../index.js'

/** The ring the fifth cell wears on focus-visible, drawn at rest so the stage can show it; not under forced colours, where a ring at rest would read as focus. */
const RING = 'not-forced-colors:*:nth-5:outline-solid not-forced-colors:*:nth-5:outline-(length:--tc-ring-width) not-forced-colors:*:nth-5:outline-offset-(length:--tc-ring-offset) not-forced-colors:*:nth-5:outline-ring'

/** The stage the frame draws: four of six digits typed and the next cell's ring, the field named by a hidden label. */
export default function Demo() {
  return (
    <div>
      <label htmlFor="otp-stage-code" className="sr-only">Verification code</label>
      <OTPField id="otp-stage-code" defaultValue="4829" className={RING} />
    </div>
  )
}
