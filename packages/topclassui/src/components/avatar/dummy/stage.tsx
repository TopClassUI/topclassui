import { Svg } from '#components/svg/index.js'
import { user } from '#icons/data/user.js'
import { AvatarFallback, AvatarImage, AvatarRoot } from '../index.js'

/** Inline, so the demo never reaches the network: the picture Figma 137:461 draws, a white image glyph on primary blue-600. */
const PICTURE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23155dfc'/%3E%3Cpath transform='translate%2810 10%29 scale%280.078125%29' d='M216,40H40A16,16,0,0,0,24,56V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,16V158.75l-26.07-26.06a16,16,0,0,0-22.63,0l-20,20-44-44a16,16,0,0,0-22.62,0L40,149.37V56ZM40,172l52-52,80,80H40Zm176,28H194.63l-36-36,20-20L216,181.38V200ZM144,100a12,12,0,1,1,12,12A12,12,0,0,1,144,100Z' fill='%23fff'/%3E%3C/svg%3E"

/** The docs stage as Figma 137:461 draws it: a picture, initials and an icon, at xl. */
export default function Demo() {
  return (
    <div className="flex items-center gap-3.5">
      <AvatarRoot size="xl">
        <AvatarImage src={PICTURE} alt="Omar Abed" />
        <AvatarFallback>OA</AvatarFallback>
      </AvatarRoot>
      <AvatarRoot size="xl" aria-label="Omar Abed">
        <AvatarFallback>OA</AvatarFallback>
      </AvatarRoot>
      <AvatarRoot size="xl" aria-label="Guest">
        <AvatarFallback><Svg icon={user} size="1.35em" /></AvatarFallback>
      </AvatarRoot>
    </div>
  )
}
