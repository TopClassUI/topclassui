// R-5.1-2: re-exports only, as flat names (R-9.2-3); the track and its segments live in client.tsx, the skeleton in skeleton.tsx.
export { SegmentedControlItem, SegmentedControlRoot } from './client.js'
export { SegmentedControlSkeleton } from './skeleton.js'
export type {
  SegmentedControlDesignProps, SegmentedControlItemProps, SegmentedControlName, SegmentedControlRootProps,
  SegmentedControlSelection, SegmentedControlSkeletonProps,
} from './types.js'
