// R-5.12-4: Skeleton's own class tables. The radii and the control height are the shared knobs.
import { FORCED_EDGE } from '#shared/classes.js'
import type { SkeletonVariant } from './types.js'

/** The fill Figma binds; the pulse is always on, as ButtonSkeleton's is, and reduced motion stops it.
 * The fill is the whole shape, so it carries the line forced colours leave of it. */
export const SKELETON_FILL = ['bg-neutral-soft animate-pulse motion-reduce:animate-none', FORCED_EDGE].join(' ')

/** R-5.2-3: complete strings per shape. text is only a column; its rows carry the fill. */
export const SKELETON_SHAPE = {
  text: 'flex flex-col w-full',
  // A circle is a shape, not a radius knob, so it is the one radius outside the three.
  circle: 'block size-control-md shrink-0 rounded-full',
  rect: 'block h-control-md w-full rounded-control',
  card: 'block w-full aspect-5/2 rounded-box',
} as const satisfies Record<SkeletonVariant, string>

/** Three quarters of the font size, as Figma 137:916 draws the bar, with margins making up the line height, so N rows are N lines. */
export const SKELETON_ROW = 'block h-[0.75em] my-[calc((1lh-0.75em)/2)] rounded-chip'

/** The last of several rows, so the block ends like a paragraph does. */
export const SKELETON_LAST_ROW = 'w-2/3'

/** The row before the last of three or more: Figma 137:916 steps the rows down 100, 82, 64. */
export const SKELETON_NEXT_TO_LAST_ROW = 'w-5/6'
