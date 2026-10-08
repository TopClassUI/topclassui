import { Spinner } from '../index.js'

/** Each of the six tones at the default size, drawn in the tone's on-soft colour. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Spinner tone="primary" />
      <Spinner tone="neutral" />
      <Spinner tone="success" />
      <Spinner tone="warning" />
      <Spinner tone="danger" />
      <Spinner tone="info" />
    </div>
  )
}
