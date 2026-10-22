import { Kbd } from '../index.js'
import type { KbdDesignProps } from '../types.js'

/** The site's Try it stage: the frame's three sibling keys, each taking the Try it values. */
export default function Demo(props: KbdDesignProps) {
  return (
    <div className="flex items-center gap-1">
      <Kbd {...props}>Ctrl</Kbd>
      <Kbd {...props}>Shift</Kbd>
      <Kbd {...props}>K</Kbd>
    </div>
  )
}
