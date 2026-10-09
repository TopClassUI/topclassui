import { AvatarFallback, AvatarImage, AvatarRoot } from '../index.js'

/** Inline, so the demo never reaches the network. */
const PORTRAIT = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' fill='%23475569'/%3E%3Ccircle cx='20' cy='15' r='7' fill='%23e2e8f0'/%3E%3Cpath d='M6 40a14 14 0 0 1 28 0z' fill='%23e2e8f0'/%3E%3C/svg%3E"

/** The name is written beside it, so the picture takes an empty alt and the initials are hidden. */
export default function Demo() {
  return (
    <div className="flex items-center gap-3">
      <AvatarRoot>
        <AvatarImage src={PORTRAIT} alt="" />
        <AvatarFallback aria-hidden>OA</AvatarFallback>
      </AvatarRoot>
      <div className="flex flex-col">
        <span className="text-sm font-medium text-body">Omar Abed</span>
        <span className="text-sm text-muted">Maintainer</span>
      </div>
    </div>
  )
}
