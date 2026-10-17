import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import type { AvatarGroupDesignProps } from '../index.js'
import { AvatarGroup } from '../index.js'

const TEAM = [
  ['OA', 'Omar Abed'], ['LH', 'Lina Haddad'], ['SK', 'Sara Khalil'], ['MN', 'Mona Nasser'],
  ['RT', 'Rami Tahan'], ['YB', 'Yara Bakri'],
] as const

/** The docs stage: the Try it controls hand their values in as props, and every avatar takes the group's size. */
export default function Demo({ max, size }: AvatarGroupDesignProps = {}) {
  return (
    <AvatarGroup max={max} size={size} aria-label="Project team">
      {TEAM.map(([initials, name]) => (
        <AvatarRoot key={initials} size={size} role="img" aria-label={name}>
          <AvatarFallback>{initials}</AvatarFallback>
        </AvatarRoot>
      ))}
    </AvatarGroup>
  )
}
