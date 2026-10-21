import type { SkeletonDesignProps } from '../index.js'
import { Skeleton } from '../index.js'

/** The docs stage: the Try it controls hand their values in as props. */
export default function Demo(props: SkeletonDesignProps) {
  return (
    <div className="w-full max-w-xs">
      <Skeleton {...props} />
    </div>
  )
}
