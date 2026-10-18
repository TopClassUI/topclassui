import { Badge } from '../index.js'

/** The three drawn states; a badge has no hover, focus or disabled state, since nothing presses it. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge variant="solid">Solid</Badge>
      <Badge variant="soft">Soft</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  )
}
