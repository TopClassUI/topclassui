// R-5.1-2: re-exports only, as flat names (R-9.2-3). The rail and its toggle are client parts; the rest is server markup.
export { SidebarRoot, SidebarTrigger } from './client.js'
export { SidebarHeader } from './parts/sidebar-header.js'
export { SidebarBody } from './parts/sidebar-body.js'
export { SidebarGroup } from './parts/sidebar-group.js'
export { SidebarLink } from './parts/sidebar-link.js'
export { SidebarSkeleton } from './skeleton.js'
export type {
  SidebarBodyProps, SidebarDesignProps, SidebarGroupProps, SidebarHeaderProps, SidebarLinkProps, SidebarRootProps,
  SidebarSkeletonProps, SidebarTriggerProps,
} from './types.js'
