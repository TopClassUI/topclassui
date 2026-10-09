import { Svg } from '#components/svg/index.js'
import { user } from '#icons/data/user.js'
import { AvatarFallback, AvatarRoot } from '../index.js'

/** An icon as the fallback, for an account with no name yet. The root carries the name. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <AvatarRoot size="sm" role="img" aria-label="Guest">
        <AvatarFallback><Svg icon={user} /></AvatarFallback>
      </AvatarRoot>
      <AvatarRoot role="img" aria-label="Guest">
        <AvatarFallback><Svg icon={user} /></AvatarFallback>
      </AvatarRoot>
      <AvatarRoot size="xl" role="img" aria-label="Guest">
        <AvatarFallback><Svg icon={user} /></AvatarFallback>
      </AvatarRoot>
    </div>
  )
}
