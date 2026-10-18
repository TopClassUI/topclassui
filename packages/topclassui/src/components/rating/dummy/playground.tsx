import { Rating } from '../index.js'
import type { RatingDesignProps } from '../types.js'

/** The site's Try it stage: each schema prop arrives from a control, and an absent one keeps its default. */
export default function Demo(props: RatingDesignProps = {}) {
  const { readOnly, defaultValue, disabled, ...shown } = props
  if (readOnly === false) {
    return <Rating defaultValue={defaultValue ?? 3} disabled={disabled} {...shown} readOnly={false} aria-label="Rate this course" />
  }
  return <Rating value={3.5} {...shown} />
}
