import { Spinner } from '../index.js'

/** The docs sample, a route-level loading fallback: the text names the wait, so the spinner is hidden. */
export default function Demo() {
  return (
    <div className="flex items-center justify-center gap-3 py-16">
      <Spinner size="lg" aria-hidden />
      <p className="text-muted">Building your preview</p>
    </div>
  )
}
