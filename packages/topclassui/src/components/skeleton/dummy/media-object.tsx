import { Skeleton } from '../index.js'

/** The docs previewer stage: a circle beside three lines, where shrink-0 keeps it round. */
export default function Demo() {
  return (
    <div className="flex w-sm max-w-full items-center gap-4">
      <Skeleton variant="circle" />
      <Skeleton />
    </div>
  )
}
