import type { CSSProperties, ComponentPropsWithRef, FocusEvent, KeyboardEvent, MouseEvent, PointerEvent, ReactNode } from 'react'

import type { UseCollectionResult } from '#shared/collection/use-collection.js'
import type { GroupName } from '#shared/contracts/name.js'
import type { TREE_VIEW_STATUSES } from './constants.js'
import type { TreeViewSchemaInput } from './schema.js'

export type TreeViewStatus = (typeof TREE_VIEW_STATUSES)[number]

// R-8.3-4: derived from the schema, so the props and the validation cannot drift apart.
export type TreeViewDesignProps = {
  [K in keyof TreeViewSchemaInput]?: TreeViewSchemaInput[K] | undefined
}

/** R-5.6-1: a tree draws no name of its own, so it takes an aria-label or an aria-labelledby. */
export type TreeViewName = GroupName

/** One node, as plain data a Server Component can pass. A node with `children`, even an empty array, is a branch. */
export interface TreeNode {
  /** Unique in the whole tree: the key, the selected value and an expanded id. */
  id: string
  label: string
  /** An element, such as `<Svg icon={folder} />`; R-7-2. */
  icon?: ReactNode | undefined
  disabled?: boolean | undefined
  children?: readonly TreeNode[] | undefined
}

/** One visible row: its node, where it sits, and whether it is a branch and open. */
export interface TreeRow {
  node: TreeNode
  /** 1 for a root node. */
  level: number
  setSize: number
  /** 1 for the first among its siblings. */
  posInSet: number
  parentId: string | null
  branch: boolean
  open: boolean
}

/** What a key does to the tree: highlight another row, open or close a branch, or select (and open or close) a row. */
export type TreeKeyAction =
  | { type: 'move', to: number }
  | { type: 'open', index: number }
  | { type: 'close', index: number }
  | { type: 'select', index: number, toggle: boolean }

/** Ours to set, or not offered: the tree is the one tab stop, and its role, its busy state and its active row are its own. */
type DivOwned =
  | 'children' | 'defaultValue' | 'role' | 'tabIndex' | 'aria-activedescendant' | 'aria-busy' | 'aria-label'
  | 'aria-labelledby' | 'aria-multiselectable' | 'className'

export type TreeViewProps = Omit<ComponentPropsWithRef<'div'>, DivOwned> & TreeViewDesignProps & {
  /** The nodes, as plain data. Keep the array stable between renders. */
  items: readonly TreeNode[]
  /** The selected node's id, or null for none. Use with onValueChange when controlled. */
  value?: string | null | undefined
  /** The id selected when the tree mounts. */
  defaultValue?: string | null | undefined
  /** Called with the id of the node Enter, Space or a press selects. Client-only. */
  onValueChange?: ((id: string) => void) | undefined
  /** The ids of the open branches. Use with onExpandedChange when controlled. */
  expanded?: readonly string[] | undefined
  /** The ids open when the tree mounts. */
  defaultExpanded?: readonly string[] | undefined
  /** Called with every open id after a branch opens or closes: load a branch's children here. Client-only. */
  onExpandedChange?: ((ids: readonly string[]) => void) | undefined
  /** More root nodes exist, so loadMore is called when the tree nears its end. */
  hasMore?: boolean | undefined
  /** Called with no argument for the next page of root nodes, once per page; never for a branch. Client-only, or a Server Action. */
  loadMore?: (() => void | Promise<void>) | undefined
  /** What status loading says, in place of labels.common.loading. */
  loadingFallback?: ReactNode | undefined
  /** What status empty says, in place of labels.state.empty. */
  emptyFallback?: ReactNode | undefined
  /** The id of one row drawn with the keyboard ring, through the `data-focus-visible` the focus-visible variant reads: for docs and screenshots. */
  focusVisibleId?: string | undefined
  /** On the element with role tree, merged last. */
  className?: string | undefined
} & TreeViewName

/** The events the tree handles, named here so hook.ts writes no type argument. */
export type TreeKeyEvent = KeyboardEvent<HTMLDivElement>
export type TreeFocusEvent = FocusEvent<HTMLDivElement>
export type TreePointerEvent = PointerEvent<HTMLDivElement>
export type TreeMouseEvent = MouseEvent<HTMLDivElement>

/** What the hook reads: every prop but the markup's. */
export type TreeViewHookProps = Pick<
  TreeViewProps,
  | 'items' | 'value' | 'defaultValue' | 'onValueChange' | 'expanded' | 'defaultExpanded' | 'onExpandedChange'
  | 'visibleRows' | 'virtualize' | 'hasMore' | 'loadMore' | 'loadMoreThreshold' | 'status' | 'loadingFallback'
  | 'emptyFallback' | 'ref' | 'style' | 'onKeyDown' | 'onFocus' | 'onBlur' | 'onPointerDown' | 'onPointerUp' | 'onPointerCancel'
  | 'onClick'
>

/** What the hook hands the markup: the windowed rows, the tree's own attributes and the listeners it wraps. */
/** How the status line under the tree draws: nothing, the caller's own node, bars while loading, or the tray when empty. */
export type TreeNoteKind = 'idle' | 'own' | 'loading' | 'loading-more' | 'empty'

export interface TreeViewHookResult {
  treeRef: (node: HTMLDivElement | null) => void
  rows: UseCollectionResult<TreeRow>['rows']
  idOf: (index: number) => string
  selected: string | null
  active: string | null
  outOfView: boolean
  activeDescendant: string | undefined
  tabIndex: number | undefined
  busy: boolean | undefined
  /** Null while idle, never undefined: the status element always has something to say or an explicit nothing. */
  note: Exclude<ReactNode, undefined>
  noteKind: TreeNoteKind
  style: CSSProperties & { '--tc-list-pad-start': string, '--tc-list-pad-end': string, '--tc-list-rows': number | undefined }
  onKeyDown: (event: TreeKeyEvent) => void
  onFocus: (event: TreeFocusEvent) => void
  onBlur: (event: TreeFocusEvent) => void
  onPointerDown: (event: TreePointerEvent) => void
  onPointerUp: (event: TreePointerEvent) => void
  onPointerCancel: (event: TreePointerEvent) => void
  onClick: (event: TreeMouseEvent) => void
}
