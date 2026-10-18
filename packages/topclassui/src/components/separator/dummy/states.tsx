import { Separator } from '../index.js'

/** Each state with its name under it. The labelled form is not built, so there is no "with label". */
export default function Demo() {
  return (
    <div className="grid max-w-xs gap-6 text-sm">
      <div className="grid gap-2">
        <div className="flex flex-col gap-3 text-body">
          <span>Account</span>
          <Separator />
          <span>Security</span>
        </div>
        <span className="text-muted">Horizontal</span>
      </div>
      <div className="grid gap-2">
        <div className="flex h-5 items-center gap-3 text-body">
          <span>Draft</span>
          <Separator orientation="vertical" />
          <span>Edited 2 hours ago</span>
        </div>
        <span className="text-muted">Vertical</span>
      </div>
    </div>
  )
}
