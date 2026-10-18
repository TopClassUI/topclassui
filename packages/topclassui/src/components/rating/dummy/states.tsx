import { Rating } from '../index.js'

/** The states a server can render: read-only stars at none, half and full, then the radio group unset, set and disabled. */
export default function Demo() {
  return (
    <div className="flex flex-col items-start gap-3">
      <Rating value={0} />
      <Rating value={3.5} />
      <Rating value={5} />
      <Rating readOnly={false} aria-label="Not rated yet" />
      <Rating readOnly={false} defaultValue={4} aria-label="Rated" />
      <Rating readOnly={false} disabled defaultValue={2} aria-label="Disabled" />
    </div>
  )
}
