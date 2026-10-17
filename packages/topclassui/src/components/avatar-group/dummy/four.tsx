import { AvatarFallback, AvatarImage, AvatarRoot } from '#components/avatar/index.js'
import { AvatarGroup } from '../index.js'

/** Inline, so the demo never reaches the network. */
const PORTRAIT = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23475569'/%3E%3Ccircle cx='20' cy='15' r='7' fill='%23e2e8f0'/%3E%3Cpath d='M6 40a14 14 0 0 1 28 0z' fill='%23e2e8f0'/%3E%3C/svg%3E"

/** Exactly max: all four show and nothing is counted. A picture is named by its alt,
 * and initials alone by role and aria-label on the root. */
export default function Demo() {
  return (
    <AvatarGroup aria-label="Design team">
      <AvatarRoot>
        <AvatarImage src={PORTRAIT} alt="Omar Abed" />
        <AvatarFallback>OA</AvatarFallback>
      </AvatarRoot>
      <AvatarRoot role="img" aria-label="Lina Haddad">
        <AvatarFallback>LH</AvatarFallback>
      </AvatarRoot>
      <AvatarRoot>
        <AvatarImage src={PORTRAIT} alt="Sara Khalil" />
        <AvatarFallback>SK</AvatarFallback>
      </AvatarRoot>
      <AvatarRoot role="img" aria-label="Mona Nasser">
        <AvatarFallback>MN</AvatarFallback>
      </AvatarRoot>
    </AvatarGroup>
  )
}
