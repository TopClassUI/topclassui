import { Rating } from '../index.js'

/** readOnly={false}: a radio group of five, the only part that hydrates. The arrows move and
 * select, and the pointer fills up to the star it is on. A server page can render it as it is. */
export default function Demo() {
  return (
    <div className="flex flex-col items-start gap-2">
      <h2 id="rating-editable-title" className="text-sm font-medium">Rate this course</h2>
      <Rating readOnly={false} defaultValue={3} aria-labelledby="rating-editable-title" />
    </div>
  )
}
