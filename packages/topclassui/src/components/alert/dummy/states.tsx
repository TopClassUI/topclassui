import { Alert } from '../index.js'

/** The frame's strip, one cell a tone, each with its own icon so the message reads without colour. The variants and the
 * slots left out have demos of their own. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-start gap-6">
      <div role="group" aria-label="info"><Alert tone="info" title="Saved" /></div>
      <div role="group" aria-label="success"><Alert tone="success" title="Saved" /></div>
      <div role="group" aria-label="warning"><Alert tone="warning" title="Saved" /></div>
      <div role="group" aria-label="danger"><Alert tone="danger" title="Saved" /></div>
    </div>
  )
}
