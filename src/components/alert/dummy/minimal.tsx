import { Alert } from '../index.js'

/** A title alone, then a description alone: the missing part leaves no gap behind. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <Alert tone="success" title="Saved" />
      <Alert tone="info">Changes are saved as you type.</Alert>
    </div>
  )
}
