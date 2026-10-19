// Re-exports only, as flat names (R-9.2-3): a server file imports CardHeader, never Card.Header.
export { CardRoot } from './parts/card-root.js'
export { CardMedia } from './parts/card-media.js'
export { CardHeader } from './parts/card-header.js'
export { CardBody } from './parts/card-body.js'
export { CardFooter } from './parts/card-footer.js'
export { CardSkeleton } from './skeleton.js'
export type {
  CardBodyProps, CardFooterProps, CardHeaderProps, CardMediaProps, CardRootProps, CardSkeletonProps,
} from './types.js'
