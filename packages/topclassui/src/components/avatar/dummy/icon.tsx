import { Svg } from '#components/svg/index.js'
import { user } from '#icons/data/user.js'
import { AvatarFallback, AvatarRoot } from '../index.js'

/** An icon as the fallback, for an account with no name yet. The root carries the name. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <AvatarRoot size="sm" aria-label="Guest">
        <AvatarFallback><Svg icon={user} size="1.35em" /></AvatarFallback>
      </AvatarRoot>
      <AvatarRoot aria-label="Guest">
        <AvatarFallback><Svg icon={user} size="1.35em" /></AvatarFallback>
      </AvatarRoot>
      <AvatarRoot size="xl" aria-label="Guest">
        <AvatarFallback><Svg icon={user} size="1.35em" /></AvatarFallback>
      </AvatarRoot>
    </div>
  )
}
