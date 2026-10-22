import { Svg } from '#components/svg/index.js'
import { user } from '#icons/data/user.js'
import { AvatarFallback, AvatarImage, AvatarRoot, AvatarSkeleton } from '../index.js'

/** Inline, so the demo never reaches the network. */
const PORTRAIT = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23475569'/%3E%3Ccircle cx='20' cy='15' r='7' fill='%23e2e8f0'/%3E%3Cpath d='M6 40a14 14 0 0 1 28 0z' fill='%23e2e8f0'/%3E%3C/svg%3E"

/** One cell per state, named by its aria-label: the four Figma 137:461 draws; a picture that failed is the failed demo. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-6">
      <div role="group" aria-label="image">
        <AvatarRoot>
          <AvatarImage src={PORTRAIT} alt="Omar Abed" />
          <AvatarFallback>OA</AvatarFallback>
        </AvatarRoot>
      </div>
      <div role="group" aria-label="initials">
        <AvatarRoot aria-label="Lina Haddad">
          <AvatarFallback>LH</AvatarFallback>
        </AvatarRoot>
      </div>
      <div role="group" aria-label="icon">
        <AvatarRoot aria-label="Guest">
          <AvatarFallback><Svg icon={user} size="1.35em" /></AvatarFallback>
        </AvatarRoot>
      </div>
      <div role="group" aria-label="loading">
        <AvatarSkeleton />
      </div>
    </div>
  )
}
