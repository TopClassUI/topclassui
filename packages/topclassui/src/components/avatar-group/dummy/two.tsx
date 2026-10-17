import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import { AvatarGroup } from '../index.js'

/** Two members fit under the default max of four, so there is no counter. */
export default function Demo() {
  return (
    <AvatarGroup aria-label="Reviewers">
      <AvatarRoot role="img" aria-label="Omar Abed">
        <AvatarFallback>OA</AvatarFallback>
      </AvatarRoot>
      <AvatarRoot role="img" aria-label="Lina Haddad">
        <AvatarFallback>LH</AvatarFallback>
      </AvatarRoot>
    </AvatarGroup>
  )
}
