import { Alert } from '../index.js'

const CELL = 'grid min-h-14 place-items-center'

/** The frame's strip, one equal cell a tone, each alert the same width and with its own icon so the message reads
 * without colour. The variants and the slots left out have demos of their own. */
export default function Demo() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-4">
      <div role="group" aria-label="info" className={CELL}><Alert tone="info" title="Saved" className="w-36" /></div>
      <div role="group" aria-label="success" className={CELL}><Alert tone="success" title="Saved" className="w-36" /></div>
      <div role="group" aria-label="warning" className={CELL}><Alert tone="warning" title="Saved" className="w-36" /></div>
      <div role="group" aria-label="danger" className={CELL}><Alert tone="danger" title="Saved" className="w-36" /></div>
    </div>
  )
}
