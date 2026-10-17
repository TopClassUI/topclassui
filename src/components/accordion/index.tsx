// R-5.1-2: re-exports only, as flat names (R-9.2-3); both parts live in client.tsx, and the skeleton beside them.
export { AccordionItem, AccordionRoot } from './client.js'
export { AccordionSkeleton } from './skeleton.js'
export type {
  AccordionDesignProps, AccordionHeading, AccordionHeadingLevel, AccordionItemProps, AccordionRootProps,
  AccordionSkeletonProps,
} from './types.js'
