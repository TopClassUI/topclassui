import { AvatarFallback, AvatarRoot } from '#components/avatar/index.js'
import { AvatarGroup } from '../index.js'

/** custom emits no size, so one class on the group sizes every child and the counter alike. */
export default function Demo() {
  return (
    <AvatarGroup size="custom" max={2} className="*:size-16 *:text-lg" aria-label="Founders">
      <AvatarRoot size="custom" role="img" aria-label="Omar Abed">
        <AvatarFallback>OA</AvatarFallback>
      </AvatarRoot>
      <AvatarRoot size="custom" role="img" aria-label="Lina Haddad">
        <AvatarFallback>LH</AvatarFallback>
      </AvatarRoot>
      <AvatarRoot size="custom" role="img" aria-label="Sara Khalil">
        <AvatarFallback>SK</AvatarFallback>
      </AvatarRoot>
      <AvatarRoot size="custom" role="img" aria-label="Mona Nasser">
        <AvatarFallback>MN</AvatarFallback>
      </AvatarRoot>
    </AvatarGroup>
  )
}
