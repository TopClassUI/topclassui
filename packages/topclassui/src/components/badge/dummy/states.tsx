import { Badge } from '../index.js'

/** One cell per drawn state, named by its aria-label; a badge has no hover, focus or disabled state, since nothing presses it. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div role="group" aria-label="solid"><Badge variant="solid">Badge</Badge></div>
      <div role="group" aria-label="soft"><Badge variant="soft">Badge</Badge></div>
      <div role="group" aria-label="outline"><Badge variant="outline">Badge</Badge></div>
    </div>
  )
}
