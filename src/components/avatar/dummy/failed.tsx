import { AvatarFallback, AvatarImage, AvatarRoot } from '../index.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

/** Not a picture, so it fails the way a 404 does and the demo never reaches the network. */
const FAILED = 'data:image/svg+xml,failed'

/** A picture that failed: the browser's mark sits in the corner and the initials stay readable. */
export default function Demo() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {SIZES.map((size) => (
        <AvatarRoot key={size} size={size}>
          <AvatarImage src={FAILED} alt="Omar Abed" />
          <AvatarFallback>OA</AvatarFallback>
        </AvatarRoot>
      ))}
    </div>
  )
}
