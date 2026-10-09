import { Skeleton } from '../index.js'

/** In right to left the circle sits at the right and the short last row starts there too;
 * the card below has no side to mirror. */
export default function Demo() {
  return (
    <div dir="rtl" lang="ar" className="flex max-w-sm flex-col gap-6">
      <div className="flex items-center gap-4">
        <Skeleton variant="circle" />
        <Skeleton />
      </div>
      <Skeleton variant="card" />
    </div>
  )
}
