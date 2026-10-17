import { clamp } from '#shared/clamp.js'
import { cn } from '#shared/cn.js'
import { COLLECTION_BOUNDARIES } from '#shared/contracts/collection.js'
// Named here as well, so a consumer program that never compiles shared/ gets the --tc-* keys.
import type {} from '#shared/style-tokens.js'
import {
  TREE_VIEW_SKELETON_BOX, TREE_VIEW_SKELETON_ICON, TREE_VIEW_SKELETON_LABEL, TREE_VIEW_SKELETON_ROW, TREE_VIEW_SKELETON_WIDTH,
} from './classes.js'
import { TREE_VIEW_SKELETON_DEFAULTS, TREE_VIEW_SKELETON_LEVELS } from './constants.js'
import type { TreeViewSkeletonProps } from './types.js'

/** Holds a tree's place while its nodes load: the tree's own box and rows, each an icon and a label of nothing,
 * so the tree arrives without moving the page. */
export function TreeViewSkeleton({ rows = TREE_VIEW_SKELETON_DEFAULTS.rows, className, ...rest }: TreeViewSkeletonProps) {
  // R-5.7-7; trunc too, or rows={2.5} asks for half a row.
  const count = Math.trunc(clamp(rows, COLLECTION_BOUNDARIES.visibleRowsMin, COLLECTION_BOUNDARIES.visibleRowsMax))

  return (
    <div className={cn(TREE_VIEW_SKELETON_BOX, className)} {...rest} aria-hidden>
      {Array.from({ length: count }, (_, row) => (
        <div
          key={row}
          style={{ '--tc-tree-level': TREE_VIEW_SKELETON_LEVELS[row % TREE_VIEW_SKELETON_LEVELS.length] }}
          className={TREE_VIEW_SKELETON_ROW}
        >
          <span className={TREE_VIEW_SKELETON_ICON} />
          <span className={cn(TREE_VIEW_SKELETON_LABEL, TREE_VIEW_SKELETON_WIDTH[row % TREE_VIEW_SKELETON_WIDTH.length])} />
        </div>
      ))}
    </div>
  )
}
