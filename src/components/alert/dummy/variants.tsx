import { Alert } from '../index.js'

export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <Alert variant="soft" title="Soft">A tint of the tone, for most messages.</Alert>
      <Alert variant="solid" title="Solid">The full fill, for the one message that must not be missed.</Alert>
      <Alert variant="outline" title="Outline">A line in the tone colour, on the page background.</Alert>
    </div>
  )
}
