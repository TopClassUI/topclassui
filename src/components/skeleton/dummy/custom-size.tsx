import { Skeleton } from '../index.js'

/** Real dimensions through className, passed last: the circle's size, the rect's height and width,
 * the card's width and radius, and the width and type step of two text rows. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-6">
      <Skeleton variant="circle" className="size-12" />
      <Skeleton variant="rect" className="h-control-sm w-32" />
      <Skeleton variant="card" className="w-64 rounded-control" />
      <Skeleton rows={2} className="w-48 text-lg" />
    </div>
  )
}
