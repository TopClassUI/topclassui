import { InputSkeleton } from '../skeleton.js'

/** Its own width at each size, as the field has, and the whole column with fullWidth. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-3">
      <InputSkeleton size="sm" />
      <InputSkeleton />
      <InputSkeleton size="lg" />
      <InputSkeleton fullWidth />
    </div>
  )
}
