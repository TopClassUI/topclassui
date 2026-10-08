import { Skeleton } from '../index.js'

/** Three rows beside three lines of real text that never wrap, at two type steps, so a height mismatch shows. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-8">
      <div className="grid max-w-xl grid-cols-2 items-start gap-6 text-sm">
        <p className="text-body">
          <span className="block truncate">Invoice 2041 was paid</span>
          <span className="block truncate">on the seventh of October</span>
          <span className="block truncate">by bank transfer.</span>
        </p>
        <Skeleton rows={3} />
      </div>
      <div className="grid max-w-xl grid-cols-2 items-start gap-6 text-lg">
        <p className="text-body">
          <span className="block truncate">Invoice 2041 was paid</span>
          <span className="block truncate">on the seventh of October</span>
          <span className="block truncate">by bank transfer.</span>
        </p>
        <Skeleton rows={3} />
      </div>
    </div>
  )
}
