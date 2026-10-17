// R-5.1-2: re-exports only, as a flat name (R-9.2-3); the tree lives in client.tsx, its placeholder in skeleton.tsx.
export { TreeView } from './client.js'
export { TreeViewSkeleton } from './skeleton.js'
export type {
  TreeNode, TreeViewDesignProps, TreeViewName, TreeViewProps, TreeViewSkeletonDesignProps, TreeViewSkeletonProps,
  TreeViewStatus,
} from './types.js'
