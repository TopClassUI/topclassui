import { Svg } from '#components/svg/index.js'
import { user } from '#icons/data/user.js'
import { AvatarFallback, AvatarRoot } from '../index.js'

/** An icon as the fallback, for an account with no name yet. The label names it. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <AvatarRoot size="sm">
        <AvatarFallback><Svg icon={user} label="Guest" /></AvatarFallback>
      </AvatarRoot>
      <AvatarRoot>
        <AvatarFallback><Svg icon={user} label="Guest" /></AvatarFallback>
      </AvatarRoot>
      <AvatarRoot size="xl">
        <AvatarFallback><Svg icon={user} label="Guest" /></AvatarFallback>
      </AvatarRoot>
    </div>
  )
}
