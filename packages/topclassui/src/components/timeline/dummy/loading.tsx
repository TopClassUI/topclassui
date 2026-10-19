import { TimelineSkeleton } from '../index.js'

/** While the events load: the skeleton holds the rail's place, hidden from a screen reader. */
export default function Demo() {
  return (
    <div className="max-w-sm" aria-busy="true">
      <TimelineSkeleton />
    </div>
  )
}
