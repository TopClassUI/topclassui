import { Rating } from '../index.js'

/** Every radio is disabled: no key, no click, no hover fill, and nothing is submitted. */
export default function Demo() {
  return <Rating readOnly={false} disabled defaultValue={2} aria-label="Locked rating" />
}
