import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import { AvatarGroup } from '../index.js'

const TEAM = [
  ['OA', 'Omar Abed'], ['LH', 'Lina Haddad'], ['SK', 'Sara Khalil'], ['MN', 'Mona Nasser'],
  ['RT', 'Rami Tahan'], ['YB', 'Yara Bakri'], ['DF', 'Dana Fares'],
] as const

const STATES = [
  ['Two', 2],
  ['Four', 4],
  ['Overflow', 7],
] as const

/** The three drawn states under the default max of four: two members, exactly four, and three counted. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-start gap-6 text-sm text-muted">
      {STATES.map(([name, members]) => (
        <div key={name} className="grid justify-items-start gap-2">
          <AvatarGroup aria-label={name}>
            {TEAM.slice(0, members).map(([initials, person]) => (
              <AvatarRoot key={initials} role="img" aria-label={person}>
                <AvatarFallback>{initials}</AvatarFallback>
              </AvatarRoot>
            ))}
          </AvatarGroup>
          <span>{name}</span>
        </div>
      ))}
    </div>
  )
}
