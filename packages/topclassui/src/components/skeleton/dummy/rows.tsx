import { Skeleton } from '../index.js'

/** One row stays full width; with more than one, the last is two thirds, like a paragraph's end. */
export default function Demo() {
  return (
    <div className="grid w-2xl max-w-full grid-cols-3 items-start gap-6">
      <Skeleton rows={1} />
      <Skeleton />
      <Skeleton rows={5} />
    </div>
  )
}
