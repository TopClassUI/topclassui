import { Rating } from '../index.js'
import type { RatingDesignProps } from '../types.js'

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default. Until a value
 * arrives, the frame's three rows: every star, three, none. */
export default function Demo(props: RatingDesignProps = {}) {
  const { readOnly, defaultValue, disabled, value, ...shown } = props
  if (readOnly === false) {
    return <Rating defaultValue={defaultValue ?? 3} disabled={disabled} {...shown} readOnly={false} aria-label="Rate this course" />
  }
  if (value !== undefined) return <Rating value={value} {...shown} />
  return (
    <div className="grid justify-items-start gap-2">
      <Rating value={5} {...shown} />
      <Rating value={3} {...shown} />
      <Rating value={0} {...shown} />
    </div>
  )
}
