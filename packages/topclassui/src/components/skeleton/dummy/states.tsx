import { Skeleton } from '../index.js'

/** One cell per shape, named by its aria-label, as Figma 137:916 draws the strip. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-6">
      <div role="group" aria-label="text"><Skeleton variant="text" /></div>
      <div role="group" aria-label="circle"><Skeleton variant="circle" /></div>
      <div role="group" aria-label="rect"><Skeleton variant="rect" /></div>
      <div role="group" aria-label="card"><Skeleton variant="card" /></div>
    </div>
  )
}
