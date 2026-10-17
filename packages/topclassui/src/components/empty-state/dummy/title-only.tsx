import { EmptyState } from '../index.js'

/** icon={null} hides the icon, and a caller's title with no description shows no description. */
export default function Demo() {
  return (
    <div className="max-w-85">
      <EmptyState icon={null} title="No comments yet" />
    </div>
  )
}
