import { Rating } from '../index.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

/** The star follows the icon scale, 16 to 40 px. custom draws it at 1em, so the text size sets it.
 * An editing step never drops under 24 px, even at xs. */
export default function Demo() {
  return (
    <div className="flex flex-col items-start gap-3">
      {SIZES.map((size) => <Rating key={size} size={size} value={3.5} />)}
      <Rating size="custom" value={2} className="text-3xl" />
      <Rating readOnly={false} size="xs" defaultValue={2} aria-label="Extra small" />
      <Rating readOnly={false} size="custom" defaultValue={2} aria-label="Your own size" className="text-3xl" />
    </div>
  )
}
