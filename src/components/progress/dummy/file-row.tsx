import { Progress } from '../index.js'

/** The real consumer: a 4 px bar at a fixed width under a file name, which names it. */
export default function Demo() {
  return (
    <div className="flex max-w-sm flex-col gap-2 rounded-box border border-line p-3">
      <span id="file-brief" className="truncate text-sm">brief.pdf</span>
      <Progress size="sm" value={65} className="w-50 max-w-full" aria-labelledby="file-brief" />
    </div>
  )
}
