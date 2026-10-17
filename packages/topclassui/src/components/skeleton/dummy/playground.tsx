import type { SkeletonDesignProps } from '../index.js'
import { Skeleton } from '../index.js'

/** The docs stage: the Try it controls hand their values in as props. */
export default function Demo({ variant, rows }: SkeletonDesignProps = {}) {
  return (
    <div className="max-w-sm">
      <Skeleton variant={variant} rows={rows} />
    </div>
  )
}
