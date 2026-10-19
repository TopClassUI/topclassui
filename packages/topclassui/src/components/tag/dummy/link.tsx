import { LABEL } from '#shared/classes.js'
import { tagVariants } from '../index.js'

const LONG = 'Infrastructure, platform reliability and developer experience working group'
const chip = tagVariants({ tone: 'info', interactive: true })

/** A linked tag: the link is the chip, so its focus ring is never clipped. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <a href="#design-systems" className={chip}>Design systems</a>
        <a href="#accessibility" className={chip}>Accessibility</a>
      </div>
      <div className="w-50 rounded-box border border-line p-2" data-narrow>
        <a href="#working-group" className={chip}><span className={LABEL}>{LONG}</span></a>
      </div>
      <div className="w-50 rounded-box border border-line p-2" data-narrow>
        <a href="#platform" className={chip}>{LONG}</a>
      </div>
    </div>
  )
}
