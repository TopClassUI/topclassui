import { Kbd } from '../index.js'

/** The nested form of the HTML spec: a plain outer kbd the caller writes, spacing the keys 4 px apart. */
export default function Demo() {
  return (
    <p className="text-sm text-body">
      Press <kbd className="inline-flex items-center gap-1"><Kbd>Shift</Kbd><Kbd>Tab</Kbd></kbd> to move focus backwards.
    </p>
  )
}
