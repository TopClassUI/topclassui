import { Svg } from '#components/svg/index.js'
import { user } from '#icons/data/user.js'
import { AvatarFallback, AvatarImage, AvatarRoot, AvatarSkeleton } from '../index.js'

/** Inline, so the demo never reaches the network. */
const PORTRAIT = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23475569'/%3E%3Ccircle cx='20' cy='15' r='7' fill='%23e2e8f0'/%3E%3Cpath d='M6 40a14 14 0 0 1 28 0z' fill='%23e2e8f0'/%3E%3C/svg%3E"

/** Not a picture, so it fails the way a 404 does. */
const FAILED = 'data:image/svg+xml,failed'

/** Each state with its name under it: a picture, initials, an icon, a picture that failed, and loading. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-start gap-6 text-sm text-muted">
      <div className="grid justify-items-center gap-2">
        <AvatarRoot size="lg">
          <AvatarImage src={PORTRAIT} alt="Omar Abed" />
          <AvatarFallback>OA</AvatarFallback>
        </AvatarRoot>
        <span>Image</span>
      </div>
      <div className="grid justify-items-center gap-2">
        <AvatarRoot size="lg" aria-label="Lina Haddad">
          <AvatarFallback>LH</AvatarFallback>
        </AvatarRoot>
        <span>Initials</span>
      </div>
      <div className="grid justify-items-center gap-2">
        <AvatarRoot size="lg" aria-label="Guest">
          <AvatarFallback><Svg icon={user} /></AvatarFallback>
        </AvatarRoot>
        <span>Icon</span>
      </div>
      <div className="grid justify-items-center gap-2">
        <AvatarRoot size="lg">
          <AvatarImage src={FAILED} alt="Sara Khalil" />
          <AvatarFallback>SK</AvatarFallback>
        </AvatarRoot>
        <span>Failed</span>
      </div>
      <div className="grid justify-items-center gap-2">
        <AvatarSkeleton size="lg" />
        <span>Loading</span>
      </div>
    </div>
  )
}
