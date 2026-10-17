import { Spinner } from '../index.js'

/** text-current replaces the tone, so each spinner takes the colour of the line it sits in. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <p className="flex items-center gap-2 rounded-box bg-danger-soft p-3 text-danger-on-soft">
        <Spinner size="sm" className="text-current" aria-hidden />
        Retrying the payment
      </p>
      <p className="flex items-center gap-2 text-muted">
        <Spinner size="sm" className="text-current" aria-hidden />
        Saving the draft
      </p>
    </div>
  )
}
