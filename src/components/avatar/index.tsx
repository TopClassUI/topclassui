// Re-exports only, as flat names (R-9.2-3): a server file imports AvatarImage, never Avatar.Image.
export { AvatarRoot } from './parts/avatar-root.js'
export { AvatarImage } from './parts/avatar-image.js'
export { AvatarFallback } from './parts/avatar-fallback.js'
export { AvatarSkeleton } from './skeleton.js'
export type {
  AvatarDesignProps, AvatarFallbackProps, AvatarImageProps, AvatarRootProps, AvatarSize,
  AvatarSkeletonProps,
} from './types.js'
