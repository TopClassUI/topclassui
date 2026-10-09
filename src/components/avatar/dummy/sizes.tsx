import { Button } from '#components/button/index.js'
import { AvatarFallback, AvatarRoot } from '../index.js'

const SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const

/** Each avatar beside a Button of the same size: the two are the same height, so rows line up. */
export default function Demo() {
  return (
    <div className="flex flex-col gap-3">
      {SIZES.map((size) => (
        <div key={size} className="flex items-center gap-3">
          <AvatarRoot size={size} role="img" aria-label="Omar Abed">
            <AvatarFallback>OA</AvatarFallback>
          </AvatarRoot>
          <Button size={size} variant="outline" tone="neutral">Follow</Button>
        </div>
      ))}
    </div>
  )
}
