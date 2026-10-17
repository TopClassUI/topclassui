import { Rating } from '../index.js'

/** Ten stars at xl, the widest a rating gets: 436 px, so on a phone the row wraps rather than
 * scrolling the page. */
export default function Demo() {
  return (
    <div className="flex flex-col items-start gap-4">
      <Rating max={10} size="xl" value={7.5} />
      <Rating readOnly={false} max={10} size="xl" defaultValue={8} aria-label="Out of ten" />
    </div>
  )
}
