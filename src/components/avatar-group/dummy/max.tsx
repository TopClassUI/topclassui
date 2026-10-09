import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import { AvatarGroup } from '../index.js'

/** The docs sample: max counts children, so three children under max 2 leave one counted. */
export default function Demo() {
  return (
    <AvatarGroup max={2} aria-label="Assignees">
      <AvatarRoot role="img" aria-label="Omar Abed">
        <AvatarFallback>OA</AvatarFallback>
      </AvatarRoot>
      <AvatarRoot role="img" aria-label="Lina Haddad">
        <AvatarFallback>LH</AvatarFallback>
      </AvatarRoot>
      <AvatarRoot role="img" aria-label="Sara Khalil">
        <AvatarFallback>SK</AvatarFallback>
      </AvatarRoot>
    </AvatarGroup>
  )
}
