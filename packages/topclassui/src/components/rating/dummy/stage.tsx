import { Rating } from '../index.js'

/** The docs stage as the frame draws it: every star, three, none. Read-only stars are server HTML and ship no script. */
export default function Demo() {
  return (
    <div className="grid justify-items-start gap-2">
      <Rating value={5} />
      <Rating value={3} />
      <Rating value={0} />
    </div>
  )
}
