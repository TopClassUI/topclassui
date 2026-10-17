import type { SeparatorDesignProps } from '../index.js'
import { Separator } from '../index.js'

/** A vertical line takes its height from a flex row, so the row changes with the orientation. */
const LAYOUT = {
  horizontal: 'flex flex-col gap-3 text-sm text-body',
  vertical: 'flex h-5 items-center gap-3 text-sm text-body',
} as const

/** The docs stage: the Try it controls hand their values in as props. */
export default function Demo({ orientation = 'horizontal', decorative }: SeparatorDesignProps = {}) {
  return (
    <div className={LAYOUT[orientation]}>
      <span>Profile</span>
      <Separator orientation={orientation} decorative={decorative} />
      <span>Billing</span>
    </div>
  )
}
