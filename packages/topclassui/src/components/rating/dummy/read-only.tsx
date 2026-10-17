import { Rating } from '../index.js'

/** Stars that only show a value: server HTML, no script. 3.5 draws half a star, and 3.7 rounds to it. */
export default function Demo() {
  return (
    <div className="flex flex-col items-start gap-3">
      <Rating value={0} />
      <Rating value={3} />
      <Rating value={5} />
      <Rating value={3.5} />
      <p className="flex flex-wrap items-center gap-2">
        <Rating value={3.7} />
        <span className="text-sm text-muted">128 reviews</span>
      </p>
    </div>
  )
}
