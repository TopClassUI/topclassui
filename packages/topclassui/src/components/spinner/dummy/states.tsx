import { Spinner } from '../index.js'

/** Every state the strip draws, one cell each, captioned by its name: the five sizes. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <Spinner size="xs" aria-label="xs" />
      <Spinner size="sm" aria-label="sm" />
      <Spinner size="md" aria-label="md" />
      <Spinner size="lg" aria-label="lg" />
      <Spinner size="xl" aria-label="xl" />
    </div>
  )
}
