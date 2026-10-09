// R-5.12-4: Skeleton's own class tables. The radii and the control height are the shared knobs.
import type { SkeletonVariant } from './types.js'

/** The fill Figma binds; the pulse is always on, as ButtonSkeleton's is, and reduced motion stops it. */
export const SKELETON_FILL = 'bg-neutral-soft animate-pulse motion-reduce:animate-none'

/** R-5.2-3: complete strings per shape. text is only a column; its rows carry the fill. */
export const SKELETON_SHAPE = {
  text: 'flex flex-col w-full',
  // A circle is a shape, not a radius knob, so it is the one radius outside the three.
  circle: 'block size-control-md shrink-0 rounded-full',
  rect: 'block h-control-md w-full rounded-control',
  card: 'block w-full aspect-5/2 rounded-box',
} as const satisfies Record<SkeletonVariant, string>

/** As tall as the font size, with margins making up the line height, so N rows are N lines. */
export const SKELETON_ROW = 'block h-[1em] my-[calc((1lh-1em)/2)] rounded-chip'

/** The last of several rows, so the block ends like a paragraph does. */
export const SKELETON_LAST_ROW = 'w-2/3'
