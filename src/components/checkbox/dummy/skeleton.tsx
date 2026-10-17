import { Checkbox, CheckboxSkeleton } from '../index.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

/** Each checkbox beside the skeleton that holds its place, in a wrapper each: the same box. */
export default function Demo() {
  return (
    <div className="grid gap-4">
      {SIZES.map((size) => (
        <div key={size} data-pair={size} className="flex items-center gap-4">
          <div><Checkbox size={size} aria-label={`Terms, ${size}`} /></div>
          <div><CheckboxSkeleton size={size} /></div>
        </div>
      ))}
    </div>
  )
}
