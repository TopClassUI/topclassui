import { InputSkeleton } from '../skeleton.js'

export default function Demo() {
  return (
    <div className="grid max-w-sm gap-3">
      <InputSkeleton size="sm" />
      <InputSkeleton />
      <InputSkeleton size="lg" />
    </div>
  )
}
