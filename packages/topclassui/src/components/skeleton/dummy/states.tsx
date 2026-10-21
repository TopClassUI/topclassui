import { Skeleton } from '../index.js'

/** One cell per shape, named by its aria-label, as Figma 137:916 draws the strip. A placeholder fills its box, so each cell is as wide as the frame draws it. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div role="group" aria-label="text" className="w-28"><Skeleton variant="text" /></div>
      <div role="group" aria-label="circle" className="w-28"><Skeleton variant="circle" /></div>
      <div role="group" aria-label="rect" className="w-28"><Skeleton variant="rect" /></div>
      <div role="group" aria-label="card" className="w-28"><Skeleton variant="card" /></div>
    </div>
  )
}
