// R-5.12-4: AvatarGroup's own classes, set on the root and reaching each child through `*:`.

/** A ring in the page colour on every child, the counter included, so an overlap reads.
 * On the root, so a Server Component never clones the avatars it was handed. */
export const GROUP_RING = '*:ring-2 *:ring-page'

/** R-5.3-1: a logical margin, so each child after the first overlaps toward the inline start. */
export const GROUP_OVERLAP = '*:not-first:-ms-2'
