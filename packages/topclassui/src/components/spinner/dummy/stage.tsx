import { Spinner } from '../index.js'

/** The docs card's stage as the frame draws it: the sm to xl steps, 22 px apart. */
export default function Demo() {
  return (
    <div className="flex items-center gap-5.5">
      <Spinner size="sm" />
      <Spinner size="md" />
      <Spinner size="lg" />
      <Spinner size="xl" />
    </div>
  )
}
