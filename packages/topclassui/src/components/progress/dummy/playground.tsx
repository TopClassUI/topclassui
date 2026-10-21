import { Progress } from '../index.js'
import type { ProgressDesignProps } from '../index.js'

/** The docs stage, the frame's three bars 280 px wide: the Try it controls set the middle one's value, tone, size and
 * indeterminate. */
export default function Demo(props: ProgressDesignProps = {}) {
  return (
    <div className="grid w-full max-w-70 gap-3">
      <Progress value={15} aria-label="Queued" />
      <Progress value={60} {...props} aria-label="Upload" />
      <Progress tone="success" value={100} aria-label="Done" />
    </div>
  )
}
