import { Progress } from '../index.js'
import type { ProgressDesignProps } from '../index.js'

/** The docs stage: the Try it controls set the value, the tone, the size and indeterminate. */
export default function Demo(props: ProgressDesignProps = {}) {
  return (
    <div className="grid w-full max-w-xs">
      <Progress {...props} aria-label="Upload" />
    </div>
  )
}
