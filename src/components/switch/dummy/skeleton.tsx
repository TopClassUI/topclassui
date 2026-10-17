import { Switch, SwitchSkeleton } from '../index.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

/** Each switch beside the skeleton that holds its place, in a wrapper each: the same box. */
export default function Demo() {
  return (
    <div className="grid gap-4">
      {SIZES.map((size) => (
        <div key={size} data-pair={size} className="flex items-center gap-4">
          <div><Switch size={size} aria-label={`Notifications, ${size}`} /></div>
          <div><SwitchSkeleton size={size} /></div>
        </div>
      ))}
    </div>
  )
}
