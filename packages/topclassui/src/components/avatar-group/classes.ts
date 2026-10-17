// R-5.12-4: AvatarGroup's own classes, set on the root and reaching each child through `*:`.
import type { Size } from '#shared/contracts/size.js'

/** One row while it fits and never wider than its container: it wraps rather than push the
 * page sideways. w-max: a table cell sizes a column from the least its content needs, which
 * for a wrapping row is one face. shrink-0: a sibling in a flex row gives way first. */
export const GROUP_ROOT = 'inline-flex w-max max-w-full shrink-0 flex-wrap items-center gap-y-1'

/** A ring in the page colour on every child, the counter included, so an overlap reads.
 * On the root, so a Server Component never clones the avatars it was handed. */
export const GROUP_RING = '*:ring-2 *:ring-page'

/** A link or a button around an avatar is ringed as a circle too, and each child paints
 * whole before the next: without isolate the avatar before it hides the ring of a link.
 * A focused one rises over the next, so its focus ring shows all the way round. */
export const GROUP_CHILD = '*:rounded-full *:isolate *:focus-visible:z-1'

/** R-5.3-1: every child steps back over the one before it, and the root's padding puts the
 * first of each row back on the edge. Half a step at xs and sm, where a whole one hid a
 * quarter of the initials. */
export const GROUP_OVERLAP = {
  xs: 'ps-1 *:-ms-1',
  sm: 'ps-1 *:-ms-1',
  md: 'ps-2 *:-ms-2',
  lg: 'ps-2 *:-ms-2',
  xl: 'ps-2 *:-ms-2',
  custom: 'ps-2 *:-ms-2',
} as const satisfies Record<Size, string>

/** The counter is a circle until its count is too long for one, then a pill: no digit is
 * ever cut. custom emits nothing, like every size table. */
export const GROUP_COUNTER = {
  xs: 'w-auto min-w-control-xs px-1',
  sm: 'w-auto min-w-control-sm px-1',
  md: 'w-auto min-w-control-md px-1',
  lg: 'w-auto min-w-control-lg px-1',
  xl: 'w-auto min-w-control-xl px-1',
  custom: '',
} as const satisfies Record<Size, string>
