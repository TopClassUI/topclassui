import { Skeleton } from '../index.js'

/** The four shapes at their own default sizes, in a column the width of a narrow card. */
export default function Demo() {
  return (
    <div className="flex max-w-sm flex-col gap-6">
      <Skeleton />
      <Skeleton variant="circle" />
      <Skeleton variant="rect" />
      <Skeleton variant="card" />
    </div>
  )
}
