import { Spinner } from '../index.js'

/** Every state Spinner draws: the five sizes, the six tones, and the text colour beside its own text. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <Spinner size="xs" aria-label="Extra small" />
        <Spinner size="sm" aria-label="Small" />
        <Spinner size="md" aria-label="Medium" />
        <Spinner size="lg" aria-label="Large" />
        <Spinner size="xl" aria-label="Extra large" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Spinner tone="primary" aria-label="Primary" />
        <Spinner tone="neutral" aria-label="Neutral" />
        <Spinner tone="success" aria-label="Success" />
        <Spinner tone="warning" aria-label="Warning" />
        <Spinner tone="danger" aria-label="Danger" />
        <Spinner tone="info" aria-label="Info" />
      </div>
      <p className="flex items-center gap-2 text-muted">
        <Spinner size="custom" className="text-current" aria-hidden />
        Decorative, in the text colour
      </p>
    </div>
  )
}
