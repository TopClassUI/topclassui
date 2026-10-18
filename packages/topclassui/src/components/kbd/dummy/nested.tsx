import { Kbd } from '../index.js'

/** The nested form of the HTML spec: a plain outer kbd the caller writes. It stays inline, so its
 * keys follow the sentence in both directions, as sibling keys do. */
export default function Demo() {
  return (
    <p className="text-sm text-body">
      Press <kbd className="whitespace-nowrap"><Kbd>Shift</Kbd> <Kbd>Tab</Kbd></kbd> to move focus backwards.
    </p>
  )
}
