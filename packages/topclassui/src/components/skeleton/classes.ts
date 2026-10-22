// R-5.12-4: Skeleton's own class tables. The radii and the control height are the shared knobs.
import { FORCED_EDGE } from '#shared/classes.js'
import type { SkeletonVariant } from './types.js'

/** The fill Figma binds; the pulse is on by default, as ButtonSkeleton's is, and reduced motion stops it.
 * The fill is the whole shape, so it carries the line forced colours leave of it. */
export const SKELETON_FILL = ['bg-neutral-soft animate-pulse motion-reduce:animate-none', FORCED_EDGE].join(' ')

/** animate={false}: the same fill holding still for every reader, as reduced motion already holds it. */
export const SKELETON_FILL_STILL = ['bg-neutral-soft', FORCED_EDGE].join(' ')

/** R-5.2-3: complete strings per shape. text is only a column; its rows carry the fill. */
export const SKELETON_SHAPE = {
  text: 'flex flex-col w-full',
  // A circle is a shape, not a radius knob, so it is the one radius outside the three, and rounded leaves it.
  circle: 'block size-control-md shrink-0 rounded-full',
  rect: 'block h-control-md w-full',
  card: 'block w-full aspect-5/2',
} as const satisfies Record<SkeletonVariant, string>

/** rounded: the knob each shape takes its corners from, the control's and the card's, so it holds the shape of what loads. */
export const SKELETON_RADIUS = {
  text: '',
  circle: '',
  rect: 'rounded-control',
  card: 'rounded-box',
} as const satisfies Record<SkeletonVariant, string>

/** Three quarters of the font size, as Figma 137:916 draws the bar, with margins making up the line height, so N rows are N lines. */
export const SKELETON_ROW = 'block h-[0.75em] my-[calc((1lh-0.75em)/2)]'

/** rounded: a row's corners, the chip's. */
export const SKELETON_ROW_RADIUS = 'rounded-chip'

/** The last of several rows, so the block ends like a paragraph does. */
export const SKELETON_LAST_ROW = 'w-2/3'

/** The row before the last of three or more: Figma 137:916 steps the rows down 100, 82, 64. */
export const SKELETON_NEXT_TO_LAST_ROW = 'w-5/6'
