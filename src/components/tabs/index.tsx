// R-5.1-2: re-exports only, as flat names (R-9.2-3); every part lives in client.tsx, and the skeleton beside it.
export { TabsList, TabsPanel, TabsRoot, TabsTab } from './client.js'
export { TabsSkeleton } from './skeleton.js'
export type {
  TabsDesignProps, TabsListName, TabsListProps, TabsPanelProps, TabsRootProps, TabsSkeletonProps, TabsTabProps, TabsVariant,
} from './types.js'
