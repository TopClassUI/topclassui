import { Spinner } from '../index.js'

/** The five icon steps, 16 to 40 px, each named "Loading" by default. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Spinner size="xs" />
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  )
}
