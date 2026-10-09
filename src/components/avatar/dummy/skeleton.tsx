import { AvatarFallback, AvatarRoot, AvatarSkeleton } from '../index.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

/** Each skeleton above the avatar it holds the place of: the same box at every size. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        {SIZES.map((size) => <AvatarSkeleton key={size} size={size} />)}
      </div>
      <div className="flex items-center gap-3">
        {SIZES.map((size) => (
          <AvatarRoot key={size} size={size} aria-label="Omar Abed">
            <AvatarFallback>OA</AvatarFallback>
          </AvatarRoot>
        ))}
      </div>
    </div>
  )
}
