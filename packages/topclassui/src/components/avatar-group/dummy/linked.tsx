import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import { FOCUS_RING } from '#shared/classes.js'
import { cn } from '#shared/cn.js'
import { AvatarGroup } from '../index.js'

const TEAM = [
  ['OA', 'Omar Abed', '#omar'], ['LH', 'Lina Haddad', '#lina'],
  ['SK', 'Sara Khalil', '#sara'], ['MN', 'Mona Nasser', '#mona'],
  ['RT', 'Rami Tahan', '#rami'],
] as const

/** inline-flex makes the link exactly as big as its avatar, and the focus ring is the
 * library's own: the group rounds it into a circle and lifts the focused face over the next. */
const link = cn('inline-flex', FOCUS_RING)

/** Each face is a link to its person. The link is the group's child, so it takes the ring
 * and the overlap. */
export default function Demo() {
  return (
    <AvatarGroup size="lg" max={3} aria-label="Maintainers">
      {TEAM.map(([initials, name, href]) => (
        <a key={initials} href={href} className={link}>
          <AvatarRoot size="lg" aria-label={name}>
            <AvatarFallback>{initials}</AvatarFallback>
          </AvatarRoot>
        </a>
      ))}
    </AvatarGroup>
  )
}
