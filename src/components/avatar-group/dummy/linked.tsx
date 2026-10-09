import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import { AvatarGroup } from '../index.js'

const TEAM = [
  ['OA', 'Omar Abed', '/people/omar'], ['LH', 'Lina Haddad', '/people/lina'],
  ['SK', 'Sara Khalil', '/people/sara'], ['MN', 'Mona Nasser', '/people/mona'],
  ['RT', 'Rami Tahan', '/people/rami'],
] as const

/** Each face is a link to its person. The link is the group's child, so it takes the ring
 * and the overlap; inline-flex makes it exactly as big as the avatar it holds. */
export default function Demo() {
  return (
    <AvatarGroup size="lg" max={3} aria-label="Maintainers">
      {TEAM.map(([initials, name, href]) => (
        <a key={initials} href={href} className="inline-flex">
          <AvatarRoot size="lg" aria-label={name}>
            <AvatarFallback>{initials}</AvatarFallback>
          </AvatarRoot>
        </a>
      ))}
    </AvatarGroup>
  )
}
