import { EmptyState } from '../index.js'

/** No props at all: the tray icon, then the English title and description from labels. */
export default function Demo() {
  return (
    <div className="max-w-85">
      <EmptyState />
    </div>
  )
}
