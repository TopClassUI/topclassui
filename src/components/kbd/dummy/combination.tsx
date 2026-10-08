import { Kbd } from '../index.js'

/** The two pairs the Components page captions, as sibling keys on a raised card: no group, no plus. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3 rounded-box border border-line bg-surface-raised p-4 text-sm text-body">
      <p>Press <Kbd>Ctrl</Kbd> <Kbd>K</Kbd> to open the command palette.</p>
      <p>Press <Kbd>Shift</Kbd> <Kbd>Tab</Kbd> to move focus backwards.</p>
    </div>
  )
}
