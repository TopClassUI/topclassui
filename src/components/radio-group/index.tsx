// R-5.1-2: re-exports only, as flat names (R-9.2-3); the group and its radios live in client.tsx, its skeleton in skeleton.tsx.
export { RadioGroupItem, RadioGroupRoot } from './client.js'
export { RadioGroupSkeleton } from './skeleton.js'
export type {
  RadioGroupDesignProps, RadioGroupItemProps, RadioGroupName, RadioGroupOrientation, RadioGroupRootProps,
  RadioGroupSkeletonProps,
} from './types.js'
