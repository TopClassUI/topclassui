import type { SeparatorDesignProps } from '../index.js'
import { Separator } from '../index.js'

/** The docs stage: the Try it controls hand their values in as props. A horizontal line fills the row and wraps; a vertical one stretches to it. */
export default function Demo(props: SeparatorDesignProps) {
  return (
    <div className="flex min-h-5 flex-wrap items-center gap-3 text-sm text-body">
      <span>Profile</span>
      <Separator {...props} />
      <span>Billing</span>
    </div>
  )
}
