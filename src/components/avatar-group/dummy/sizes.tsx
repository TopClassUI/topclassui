import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import { AvatarGroup } from '../index.js'

const ROWS = [
  ['xs', 'Extra small'],
  ['sm', 'Small'],
  ['md', 'Medium'],
  ['lg', 'Large'],
  ['xl', 'Extra large'],
] as const

const TEAM = [
  ['OA', 'Omar Abed'], ['LH', 'Lina Haddad'], ['SK', 'Sara Khalil'], ['MN', 'Mona Nasser'],
  ['RT', 'Rami Tahan'],
] as const

/** The group hands its size to the counter only, so each avatar is given the same one. */
export default function Demo() {
  return (
    <div className="flex flex-col items-start gap-4">
      {ROWS.map(([size, label]) => (
        <AvatarGroup key={size} size={size} max={3} aria-label={label}>
          {TEAM.map(([initials, name]) => (
            <AvatarRoot key={initials} size={size} role="img" aria-label={name}>
              <AvatarFallback>{initials}</AvatarFallback>
            </AvatarRoot>
          ))}
        </AvatarGroup>
      ))}
    </div>
  )
}
