import { Skeleton } from '../index.js'

/** One cell per shape, named by its aria-label, as Figma 137:916 draws the strip; each cell has a width of its own, since a centred cell gives a full-width shape none. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div role="group" aria-label="text" className="w-28"><Skeleton variant="text" rows={2} /></div>
      <div role="group" aria-label="circle"><Skeleton variant="circle" /></div>
      <div role="group" aria-label="rect" className="w-28"><Skeleton variant="rect" /></div>
      <div role="group" aria-label="card" className="w-28"><Skeleton variant="card" /></div>
    </div>
  )
}
