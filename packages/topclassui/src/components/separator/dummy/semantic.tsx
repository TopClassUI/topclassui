import { Separator } from '../index.js'

/** decorative={false}: each line is a separator a screen reader announces with its orientation. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-4 text-sm text-body">
      <p>Account settings</p>
      <Separator decorative={false} />
      <div className="flex h-5 items-center gap-3">
        <span>Profile</span>
        <Separator orientation="vertical" decorative={false} />
        <span>Billing</span>
      </div>
    </div>
  )
}
