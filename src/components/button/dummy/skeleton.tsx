import { ButtonSkeleton } from '../skeleton.js'

export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <ButtonSkeleton size="sm" />
      <ButtonSkeleton />
      <ButtonSkeleton size="lg" />
    </div>
  )
}
