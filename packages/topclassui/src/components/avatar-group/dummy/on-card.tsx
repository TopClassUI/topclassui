import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import { CardBody, CardHeader, CardRoot } from '#components/card/index.js'
import { AvatarGroup } from '../index.js'

const TEAM = [
  ['OA', 'Omar Abed'], ['LH', 'Lina Haddad'], ['SK', 'Sara Khalil'], ['MN', 'Mona Nasser'],
  ['RT', 'Rami Tahan'], ['YB', 'Yara Bakri'],
] as const

/** The ring is the avatar's own fill, so a Card needs nothing more than the page does. */
export default function Demo() {
  return (
    <div className="max-w-xs">
      <CardRoot>
        <CardHeader>
          <h2>Design team</h2>
        </CardHeader>
        <CardBody>
          <AvatarGroup aria-label="Design team">
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
