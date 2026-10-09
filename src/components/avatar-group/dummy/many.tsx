import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import { AvatarGroup } from '../index.js'

const INITIALS = ['OA', 'LH', 'SK', 'MN', 'RT', 'YB', 'DF', 'HA', 'NS', 'KM'] as const

/** Sixty people, each with a name of their own. */
const TEAM = Array.from({ length: 60 }, (_, index) => ({
  initials: INITIALS[index % INITIALS.length] ?? 'OA',
  name: `Member ${String(index + 1)}`,
}))

/** max at its bound of twenty: one row where it fits, and on a phone the row wraps onto
 * the next line instead of pushing the page sideways. */
export default function Demo() {
  return (
    <AvatarGroup max={20} aria-label="Everyone in the company">
      {TEAM.map(({ initials, name }) => (
        <AvatarRoot key={name} aria-label={name}>
          <AvatarFallback>{initials}</AvatarFallback>
        </AvatarRoot>
      ))}
    </AvatarGroup>
  )
}
