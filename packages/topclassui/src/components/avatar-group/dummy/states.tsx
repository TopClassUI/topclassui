import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import { AvatarGroup } from '../index.js'

const TEAM = [
  ['OA', 'Omar Abed'], ['LH', 'Lina Haddad'], ['SN', 'Sara Nasser'], ['RK', 'Rami Khoury'],
  ['RT', 'Rami Tahan'], ['YB', 'Yara Bakri'], ['DF', 'Dana Fares'],
] as const

const STATES = [
  ['two', 2],
  ['four', 4],
  ['overflow', 7],
] as const

/** The three drawn states at sm under the default max of four, each group named by its aria-label: two members, exactly four, and three counted. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      {STATES.map(([name, members]) => (
        <AvatarGroup key={name} size="sm" aria-label={name}>
          {TEAM.slice(0, members).map(([initials, person]) => (
            <AvatarRoot key={initials} size="sm" role="img" aria-label={person}>
              <AvatarFallback>{initials}</AvatarFallback>
            </AvatarRoot>
          ))}
        </AvatarGroup>
      ))}
    </div>
  )
}
