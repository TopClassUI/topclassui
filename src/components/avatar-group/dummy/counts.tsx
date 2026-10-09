import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import type { AvatarSize } from '#components/avatar/index.js'
import { AvatarGroup } from '../index.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const
const COUNTS = [99, 999, 12_345] as const

/** One face that shows, and then as many members as the counter has to stand for. */
const team = (size: AvatarSize, hidden: number) => Array.from({ length: hidden + 1 }, (_, index) => (
  <AvatarRoot key={index} size={size} aria-label={`Member ${String(index + 1)}`}>
    <AvatarFallback>M</AvatarFallback>
  </AvatarRoot>
))

/** The counter is a circle until the count is too long for one, and then it widens into a
 * pill, so +12,345 keeps its plus and every digit at any size. */
export default function Demo() {
  return (
    <div className="flex flex-col items-start gap-3">
      {SIZES.map((size) => (
        <div key={size} className="flex flex-wrap items-center gap-3">
          {COUNTS.map((count) => (
            <AvatarGroup key={count} size={size} max={1} aria-label={`${size}: ${String(count)} more`}>
              {team(size, count)}
            </AvatarGroup>
          ))}
        </div>
      ))}
    </div>
  )
}
