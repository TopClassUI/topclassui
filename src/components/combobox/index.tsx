// R-5.1-2: re-exports only, as a flat name (R-9.2-3); the control lives in client.tsx, its skeleton in skeleton.tsx.
export { Combobox } from './client.js'
export { ComboboxSkeleton } from './skeleton.js'
export type {
  ComboboxDesignProps, ComboboxName, ComboboxPlacement, ComboboxProps, ComboboxSkeletonProps, ComboboxStatus,
} from './types.js'
