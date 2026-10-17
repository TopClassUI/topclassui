import { Spinner } from '../index.js'

/** custom sets no size, so each spinner is 1em and grows with the type step around it. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3 text-body">
      <p className="flex items-center gap-2 text-sm">
        <Spinner size="custom" aria-hidden />
        Syncing at text-sm
      </p>
      <p className="flex items-center gap-2 text-lg">
        <Spinner size="custom" aria-hidden />
        Syncing at text-lg
      </p>
      <p className="flex items-center gap-2 text-3xl">
        <Spinner size="custom" aria-hidden />
        Syncing at text-3xl
      </p>
    </div>
  )
}
