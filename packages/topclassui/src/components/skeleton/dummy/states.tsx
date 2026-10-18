import { Skeleton } from '../index.js'

const SHAPES = [
  ['text', 'Text'],
  ['circle', 'Circle'],
  ['rect', 'Rect'],
  ['card', 'Card'],
] as const

/** The four shapes at their own default sizes, each with its name under it. */
export default function Demo() {
  return (
    <div className="grid max-w-sm gap-6 text-sm text-muted">
      {SHAPES.map(([variant, name]) => (
        <div key={variant} className="grid gap-2">
          <Skeleton variant={variant} />
          <span>{name}</span>
        </div>
      ))}
    </div>
  )
}
