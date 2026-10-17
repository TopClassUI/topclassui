import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import { CardBody, CardHeader, CardRoot } from '#components/card/index.js'
import { AvatarGroup } from '../index.js'

const TEAM = [
  ['OA', 'Omar Abed'], ['LH', 'Lina Haddad'], ['SK', 'Sara Khalil'], ['MN', 'Mona Nasser'],
  ['RT', 'Rami Tahan'], ['YB', 'Yara Bakri'],
] as const

/** The ring is the page colour, and a Card is a raised surface: in dark mode the two differ,
 * so on a Card the ring is given the Card's own colour. */
export default function Demo() {
  return (
    <div className="max-w-xs">
      <CardRoot>
        <CardHeader>
          <h2>Design team</h2>
        </CardHeader>
        <CardBody>
          <AvatarGroup className="*:ring-surface-raised" aria-label="Design team">
            {TEAM.map(([initials, name]) => (
              <AvatarRoot key={initials} aria-label={name}>
                <AvatarFallback>{initials}</AvatarFallback>
              </AvatarRoot>
            ))}
          </AvatarGroup>
        </CardBody>
      </CardRoot>
    </div>
  )
}
