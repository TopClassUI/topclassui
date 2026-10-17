import { Rating, RatingSkeleton } from '../index.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

/** Each read-only rating beside the skeleton that holds its place, in a wrapper each: the same row. */
export default function Demo() {
  return (
    <div className="flex flex-col items-start gap-3">
      {SIZES.map((size) => (
        <div key={size} data-pair={size} className="flex flex-col items-start gap-1">
          <Rating size={size} value={3} />
          <RatingSkeleton size={size} />
        </div>
      ))}
      <div data-pair="max-ten" className="flex flex-col items-start gap-1">
        <Rating max={10} value={3} />
        <RatingSkeleton max={10} />
      </div>
    </div>
  )
}
