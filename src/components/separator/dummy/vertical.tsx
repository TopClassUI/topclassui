import { Separator } from '../index.js'

/** The row has a height, and the line stretches to it although the row centres its items. */
export default function Demo() {
  return (
    <div className="flex h-5 items-center gap-3 text-sm text-body">
      <span>Draft</span>
      <Separator orientation="vertical" />
      <span>Edited 2 hours ago</span>
    </div>
  )
}
